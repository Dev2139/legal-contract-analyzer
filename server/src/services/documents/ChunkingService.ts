import { normalizeString } from '../../utils/normalizeText';
import { PageExtract } from './PdfExtractionService';

export interface ChunkResult {
  pageNumber: number;
  chunkIndex: number;
  section: string;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
}

export class ChunkingService {
  /**
   * Splits pages into chunks preserving section headers and location metadata.
   */
  public static chunkPages(pages: PageExtract[]): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    let globalChunkIndex = 0;
    let globalCharOffset = 0;
    let currentSection = 'General Provisions';

    const sectionRegex = /^(SECTION|ARTICLE|CLAUSE|\d+[\.\)]|[A-Z\s]{4,25}$)/i;

    for (const page of pages) {
      const pageNum = page.pageNumber;
      const lines = page.text.split('\n');

      let currentBuffer = '';
      let chunkStartOffset = globalCharOffset;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Detect section headers
        if (trimmed.length < 80 && (sectionRegex.test(trimmed) || /^[0-9]+\.[0-9]*/.test(trimmed))) {
          // If buffer is substantial, flush as chunk
          if (currentBuffer.trim().length > 100) {
            chunks.push({
              pageNumber: pageNum,
              chunkIndex: globalChunkIndex++,
              section: currentSection,
              text: currentBuffer.trim(),
              normalizedText: normalizeString(currentBuffer),
              startCharIndex: chunkStartOffset,
              endCharIndex: chunkStartOffset + currentBuffer.length,
            });
            globalCharOffset += currentBuffer.length;
            currentBuffer = '';
            chunkStartOffset = globalCharOffset;
          }
          currentSection = trimmed;
        }

        currentBuffer += (currentBuffer ? ' ' : '') + trimmed;

        // If chunk exceeds ~600 words / 2500 chars, flush
        if (currentBuffer.length >= 2000) {
          chunks.push({
            pageNumber: pageNum,
            chunkIndex: globalChunkIndex++,
            section: currentSection,
            text: currentBuffer.trim(),
            normalizedText: normalizeString(currentBuffer),
            startCharIndex: chunkStartOffset,
            endCharIndex: chunkStartOffset + currentBuffer.length,
          });
          globalCharOffset += currentBuffer.length;
          currentBuffer = '';
          chunkStartOffset = globalCharOffset;
        }
      }

      // Flush remaining buffer for page
      if (currentBuffer.trim().length > 0) {
        chunks.push({
          pageNumber: pageNum,
          chunkIndex: globalChunkIndex++,
          section: currentSection,
          text: currentBuffer.trim(),
          normalizedText: normalizeString(currentBuffer),
          startCharIndex: chunkStartOffset,
          endCharIndex: chunkStartOffset + currentBuffer.length,
        });
        globalCharOffset += currentBuffer.length;
      }
    }

    return chunks;
  }
}
