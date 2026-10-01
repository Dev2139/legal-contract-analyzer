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
   * Splits document pages into semantic chunks with overlapping context
   * and clean section header detection.
   */
  public static chunkPages(pages: PageExtract[]): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    let globalChunkIndex = 0;
    let globalCharOffset = 0;
    let currentSection = 'General Terms & Provisions';

    const sectionRegex = /^(SECTION|ARTICLE|CLAUSE|\d+[\.\)]|[A-Z0-9\s]{4,40}$)/i;

    for (const page of pages) {
      const pageNum = page.pageNumber;
      const paragraphs = page.text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

      let currentChunkText = '';
      let chunkStartOffset = globalCharOffset;

      for (const paragraph of paragraphs) {
        const trimmedP = paragraph.trim().replace(/\s+/g, ' ');
        if (!trimmedP) continue;

        // Check if paragraph starts with or is a section header
        const firstLine = trimmedP.split(/\n|\./)[0].trim();
        if (firstLine.length < 80 && (sectionRegex.test(firstLine) || /^[0-9]+\.[0-9]*/.test(firstLine))) {
          if (currentChunkText.length > 80) {
            chunks.push({
              pageNumber: pageNum,
              chunkIndex: globalChunkIndex++,
              section: currentSection,
              text: currentChunkText.trim(),
              normalizedText: normalizeString(currentChunkText),
              startCharIndex: chunkStartOffset,
              endCharIndex: chunkStartOffset + currentChunkText.length,
            });
            globalCharOffset += currentChunkText.length;
            currentChunkText = '';
            chunkStartOffset = globalCharOffset;
          }
          currentSection = firstLine;
        }

        // Accumulate paragraph text
        currentChunkText += (currentChunkText ? '\n\n' : '') + trimmedP;

        // Flush chunk when size reaches optimal context window (~1000 chars)
        if (currentChunkText.length >= 1000) {
          chunks.push({
            pageNumber: pageNum,
            chunkIndex: globalChunkIndex++,
            section: currentSection,
            text: currentChunkText.trim(),
            normalizedText: normalizeString(currentChunkText),
            startCharIndex: chunkStartOffset,
            endCharIndex: chunkStartOffset + currentChunkText.length,
          });
          globalCharOffset += currentChunkText.length;
          
          // Retain overlap (~150 chars) for sentence continuity across boundaries
          const overlap = currentChunkText.slice(-150);
          currentChunkText = overlap;
          chunkStartOffset = globalCharOffset - overlap.length;
        }
      }

      // Flush remaining page text
      if (currentChunkText.trim().length > 0) {
        chunks.push({
          pageNumber: pageNum,
          chunkIndex: globalChunkIndex++,
          section: currentSection,
          text: currentChunkText.trim(),
          normalizedText: normalizeString(currentChunkText),
          startCharIndex: chunkStartOffset,
          endCharIndex: chunkStartOffset + currentChunkText.length,
        });
        globalCharOffset += currentChunkText.length;
      }
    }

    return chunks;
  }
}
