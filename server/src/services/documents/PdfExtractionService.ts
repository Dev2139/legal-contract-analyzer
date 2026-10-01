import fs from 'fs';
import pdfParse from 'pdf-parse';

export interface PageExtract {
  pageNumber: number;
  text: string;
}

export interface PdfExtractionResult {
  fullText: string;
  pageCount: number;
  pages: PageExtract[];
  isScannedOrEmpty: boolean;
}

export class PdfExtractionService {
  public static async extractPdf(filePath: string): Promise<PdfExtractionResult> {
    const dataBuffer = fs.readFileSync(filePath);
    const pages: PageExtract[] = [];

    // Track per-page text using pdf-parse pagerender callback
    let currentPage = 1;
    const pageTexts: string[] = [];

    const options = {
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let lastY: number | null = null;
          let text = '';
          for (const item of textContent.items) {
            if (lastY == null || Math.abs(item.transform[5] - lastY) < 5) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          pageTexts.push(text);
          return text;
        });
      },
    };

    const pdfData = await pdfParse(dataBuffer, options);
    const pageCount = pdfData.numpages || 1;

    let fullText = pdfData.text || '';
    if (pageTexts.length > 0) {
      pageTexts.forEach((pText, idx) => {
        pages.push({
          pageNumber: idx + 1,
          text: pText.trim(),
        });
      });
    } else {
      // Fallback if pagerender didn't split cleanly
      pages.push({
        pageNumber: 1,
        text: fullText.trim(),
      });
    }

    // Detect if PDF is scanned or lacks readable text
    const cleanContent = fullText.replace(/[^a-zA-Z0-9]/g, '').trim();
    const isScannedOrEmpty = cleanContent.length < 30;

    return {
      fullText,
      pageCount,
      pages,
      isScannedOrEmpty,
    };
  }
}
