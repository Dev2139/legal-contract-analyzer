import mammoth from 'mammoth';

export interface DocxPageExtract {
  pageNumber: number;
  text: string;
}

export interface DocxExtractionResult {
  fullText: string;
  pageCount: number;
  pages: DocxPageExtract[];
  isScannedOrEmpty: boolean;
}

export class DocxExtractionService {
  public static async extractDocx(filePath: string): Promise<DocxExtractionResult> {
    const result = await mammoth.extractRawText({ path: filePath });
    const fullText = result.value || '';

    // Split DOCX into logical pages/sections based on paragraph breaks or ~3500 chars per page
    const paragraphs = fullText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    const pages: DocxPageExtract[] = [];
    let currentPageText = '';
    let currentPageNum = 1;

    for (const p of paragraphs) {
      if ((currentPageText + p).length > 3000 && currentPageText.length > 0) {
        pages.push({
          pageNumber: currentPageNum,
          text: currentPageText.trim(),
        });
        currentPageNum++;
        currentPageText = p + '\n\n';
      } else {
        currentPageText += p + '\n\n';
      }
    }

    if (currentPageText.trim().length > 0) {
      pages.push({
        pageNumber: currentPageNum,
        text: currentPageText.trim(),
      });
    }

    if (pages.length === 0) {
      pages.push({ pageNumber: 1, text: '' });
    }

    const cleanContent = fullText.replace(/[^a-zA-Z0-9]/g, '').trim();
    const isScannedOrEmpty = cleanContent.length < 20;

    return {
      fullText,
      pageCount: pages.length,
      pages,
      isScannedOrEmpty,
    };
  }
}
