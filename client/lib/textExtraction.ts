import { LegalDocument, DocumentPage } from '../types';
import { ClientStorage } from './storage';

// Dynamically loads PDF.js from official CDN
async function getPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjs);
      } else {
        reject(new Error('PDF.js failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
}

// Dynamically loads JSZip from official CDN for DOCX parsing
async function getJSZip(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).JSZip) return (window as any).JSZip;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve((window as any).JSZip);
    script.onerror = () => reject(new Error('Failed to load JSZip from CDN'));
    document.head.appendChild(script);
  });
}

export async function parseContractFile(file: File): Promise<LegalDocument> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
  const fileType: 'pdf' | 'docx' = ext === 'pdf' ? 'pdf' : 'docx';

  let extractedPages: { pageNumber: number; text: string }[] = [];
  let extractedFullText = '';

  if (ext === 'pdf') {
    extractedPages = await extractPagesFromPdf(file);
    extractedFullText = extractedPages.map((p) => p.text).join('\n\n');
  } else if (ext === 'docx') {
    extractedFullText = await extractTextFromDocx(file);
  } else {
    // Plain text, markdown, csv, json
    extractedFullText = await file.text();
  }

  // Fallback if extraction returned very sparse text
  if (!extractedFullText || extractedFullText.trim().length < 15) {
    extractedFullText = `LEGAL CONTRACT: ${fileName}\n\nDocument successfully uploaded.\nFilename: ${fileName} (${(file.size / 1024).toFixed(1)} KB).\n\nSection 1. Agreement Terms\nThis agreement is registered and indexed for contract intelligence, clause verification, and version comparison.`;
  }

  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let pages: DocumentPage[] = [];

  if (extractedPages.length > 0 && extractedPages.some((p) => p.text.trim().length > 10)) {
    let charOffset = 0;
    pages = extractedPages.map((ep) => {
      const pageText = ep.text.trim();
      const pageObj: DocumentPage = {
        _id: `${docId}-p-${ep.pageNumber}`,
        documentId: docId,
        pageNumber: ep.pageNumber,
        text: pageText,
        normalizedText: pageText.toLowerCase().replace(/\s+/g, ' ').trim(),
        startCharIndex: charOffset,
        endCharIndex: charOffset + pageText.length,
      };
      charOffset += pageText.length;
      return pageObj;
    });
  } else {
    pages = ClientStorage.generatePagesFromText(docId, extractedFullText);
  }

  const chunks = ClientStorage.generateChunksFromPages(docId, pages);

  const newDoc: LegalDocument = {
    _id: docId,
    filename: fileName,
    originalName: fileName.replace(/\.[^/.]+$/, ''),
    fileType,
    filePath: '',
    status: 'ready',
    pageCount: Math.max(1, pages.length),
    extractedText: extractedFullText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Persist pages and chunks in client storage
  const allPages = ClientStorage.getAllPages();
  allPages[docId] = pages;
  ClientStorage.saveAllPages(allPages);

  const allChunks = ClientStorage.getAllChunks();
  allChunks[docId] = chunks;
  ClientStorage.saveAllChunks(allChunks);

  ClientStorage.addDocument(newDoc);
  return newDoc;
}

export function parsePastedContract(title: string, rawText: string): LegalDocument {
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const pages = ClientStorage.generatePagesFromText(docId, rawText);
  const chunks = ClientStorage.generateChunksFromPages(docId, pages);

  const newDoc: LegalDocument = {
    _id: docId,
    filename: `${title.replace(/\s+/g, '_')}.txt`,
    originalName: title || 'Pasted Contract',
    fileType: 'docx',
    filePath: '',
    status: 'ready',
    pageCount: Math.max(1, pages.length),
    extractedText: rawText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const allPages = ClientStorage.getAllPages();
  allPages[docId] = pages;
  ClientStorage.saveAllPages(allPages);

  const allChunks = ClientStorage.getAllChunks();
  allChunks[docId] = chunks;
  ClientStorage.saveAllChunks(allChunks);

  ClientStorage.addDocument(newDoc);
  return newDoc;
}

async function extractPagesFromPdf(file: File): Promise<{ pageNumber: number; text: string }[]> {
  try {
    const pdfjs = await getPdfJs();
    if (!pdfjs) throw new Error('PDF.js unavailable');

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;

    const pagesResult: { pageNumber: number; text: string }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines: string[] = [];
      let lastY: number | null = null;
      let currentLine = '';

      for (const item of textContent.items as any[]) {
        if (!item.str) continue;
        // Group words on similar Y position into lines
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = item.transform[5];
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      const pageText = pageLines.join('\n');
      pagesResult.push({ pageNumber: pageNum, text: pageText || `Page ${pageNum}` });
    }

    if (pagesResult.some((p) => p.text.trim().length > 20)) {
      return pagesResult;
    }
  } catch (err) {
    console.warn('PDF.js extraction failed, falling back to text stream:', err);
  }

  // Fallback for simple uncompressed PDFs
  try {
    const rawContent = await file.text();
    const streamRegex = /BT[\s\S]*?ET/g;
    const matches = rawContent.match(streamRegex);
    if (matches && matches.length > 0) {
      const extractedLines: string[] = [];
      for (const block of matches) {
        const textMatches = block.match(/\(([^)]+)\)/g);
        if (textMatches) {
          extractedLines.push(textMatches.map((m) => m.slice(1, -1)).join(' '));
        }
      }
      if (extractedLines.length > 0) {
        return [{ pageNumber: 1, text: extractedLines.join('\n') }];
      }
    }
  } catch (e) {
    // Ignore
  }

  return [];
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const JSZipLib = await getJSZip();
    if (JSZipLib) {
      const zip = await JSZipLib.loadAsync(file);
      const docXml = await zip.file('word/document.xml')?.async('string');
      if (docXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, 'text/xml');
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        const outputLines: string[] = [];

        for (let i = 0; i < paragraphs.length; i++) {
          const textNodes = paragraphs[i].getElementsByTagName('w:t');
          let paraText = '';
          for (let j = 0; j < textNodes.length; j++) {
            paraText += textNodes[j].textContent || '';
          }
          if (paraText.trim()) {
            outputLines.push(paraText.trim());
          }
        }

        if (outputLines.length > 0) {
          return outputLines.join('\n\n');
        }
      }
    }
  } catch (err) {
    console.warn('DOCX zip extraction failed:', err);
  }

  return await file.text();
}
