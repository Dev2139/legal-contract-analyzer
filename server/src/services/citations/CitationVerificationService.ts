import { DocumentPageModel, IDocumentPage } from '../../models/DocumentPage';
import { DocumentModel } from '../../models/Document';
import { normalizeTextWithMapping, normalizeString } from '../../utils/normalizeText';
import { ICitationData } from '../../models/Message';

export interface UnverifiedQuote {
  documentId: string;
  quote: string;
}

export class CitationVerificationService {
  /**
   * Deterministically verifies AI quotes against actual document text in MongoDB.
   */
  public static async verifyQuotes(
    quotes: UnverifiedQuote[]
  ): Promise<ICitationData[]> {
    const verifiedCitations: ICitationData[] = [];

    for (const q of quotes) {
      if (!q.quote || !q.documentId) continue;

      const doc = await DocumentModel.findById(q.documentId);
      if (!doc) {
        verifiedCitations.push({
          documentId: q.documentId,
          quote: q.quote,
          verified: false,
          page: 1,
          startLocation: 0,
          endLocation: 0,
          reasoning: 'Document not found in database',
        });
        continue;
      }

      const pages = await DocumentPageModel.find({ documentId: q.documentId }).sort({ pageNumber: 1 });

      if (pages.length === 0) {
        verifiedCitations.push({
          documentId: q.documentId,
          documentName: doc.originalName,
          quote: q.quote,
          verified: false,
          page: 1,
          startLocation: 0,
          endLocation: 0,
          reasoning: 'No page text available for document',
        });
        continue;
      }

      // Build continuous combined text with page boundary tracking
      let fullOriginalText = '';
      const pageIndexRanges: { pageNumber: number; startIdx: number; endIdx: number }[] = [];

      for (const p of pages) {
        const start = fullOriginalText.length;
        fullOriginalText += p.text + '\n';
        const end = fullOriginalText.length;
        pageIndexRanges.push({ pageNumber: p.pageNumber, startIdx: start, endIdx: end });
      }

      // Normalize combined text and quote
      const docMapping = normalizeTextWithMapping(fullOriginalText);
      const quoteNorm = normalizeString(q.quote);

      if (!quoteNorm) continue;

      // Search normalized quote in normalized document
      let normMatchIndex = docMapping.normalizedText.indexOf(quoteNorm);

      // If not exact match, try sliding window / fuzzy phrase match
      if (normMatchIndex === -1 && quoteNorm.length > 20) {
        // Try matching first 40 chars of quote
        const partialQuote = quoteNorm.slice(0, 40);
        normMatchIndex = docMapping.normalizedText.indexOf(partialQuote);
      }

      if (normMatchIndex !== -1) {
        // Verified match found!
        const origStartIdx = docMapping.normToOrigIndex[normMatchIndex] || 0;
        const normEndIndex = Math.min(
          normMatchIndex + quoteNorm.length - 1,
          docMapping.normToOrigIndex.length - 1
        );
        const origEndIdx = docMapping.normToOrigIndex[normEndIndex] || origStartIdx + q.quote.length;

        // Determine page number from original index
        const pageRange = pageIndexRanges.find(
          (r) => origStartIdx >= r.startIdx && origStartIdx <= r.endIdx
        ) || pageIndexRanges[0];

        verifiedCitations.push({
          documentId: q.documentId,
          documentName: doc.originalName,
          quote: q.quote,
          verified: true,
          page: pageRange ? pageRange.pageNumber : 1,
          startLocation: origStartIdx,
          endLocation: origEndIdx,
          confidence: 1.0,
        });
      } else {
        // Invalid or fabricated quote
        verifiedCitations.push({
          documentId: q.documentId,
          documentName: doc.originalName,
          quote: q.quote,
          verified: false,
          page: 1,
          startLocation: 0,
          endLocation: 0,
          confidence: 0.0,
          reasoning: 'Quotation not found in source document text',
        });
      }
    }

    return verifiedCitations;
  }
}
