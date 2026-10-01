import { DocumentChunkModel, IDocumentChunk } from '../../models/DocumentChunk';
import { cleanText } from '../../utils/normalizeText';

export interface RetrievedChunk {
  documentId: string;
  documentName?: string;
  pageNumber: number;
  chunkIndex: number;
  section: string;
  text: string;
  normalizedText: string;
  score: number;
}

export class RetrievalService {
  /**
   * Retrieves top-K relevant chunks across one or multiple documents using BM25/keyword scoring.
   */
  public static async retrieveRelevantChunks(
    documentIds: string[],
    query: string,
    topK: number = 8
  ): Promise<RetrievedChunk[]> {
    if (!documentIds || documentIds.length === 0) return [];

    const chunks = await DocumentChunkModel.find({
      documentId: { $in: documentIds },
    }).populate('documentId', 'originalName');

    if (chunks.length === 0) return [];

    const cleanQuery = cleanText(query);
    const queryTokens = cleanQuery.split(' ').filter((t) => t.length > 2);

    // Compute Term Frequency and BM25 scores
    const scoredChunks: RetrievedChunk[] = chunks.map((c) => {
      const docName = (c.documentId as any)?.originalName || 'Contract';
      const chunkTextClean = cleanText(c.text);
      const sectionClean = cleanText(c.section);

      let score = 0;

      for (const token of queryTokens) {
        // Keyword match in chunk body
        const occurrences = (chunkTextClean.match(new RegExp(`\\b${token}\\b`, 'g')) || []).length;
        if (occurrences > 0) {
          score += (1 + Math.log(occurrences)) * 2;
        } else if (chunkTextClean.includes(token)) {
          score += 1;
        }

        // Extra boost for matching section header
        if (sectionClean.includes(token)) {
          score += 5;
        }
      }

      // Check phrase match boost
      if (cleanQuery.length > 5 && chunkTextClean.includes(cleanQuery)) {
        score += 10;
      }

      return {
        documentId: c.documentId._id ? c.documentId._id.toString() : (c.documentId as any).toString(),
        documentName: docName,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        section: c.section,
        text: c.text,
        normalizedText: c.normalizedText,
        score,
      };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    // If query has low top score or broad question, include top N diverse chunks
    const topResults = scoredChunks.slice(0, topK);
    
    // If no good match, return top chunks anyway so model has context to answer absence
    if (topResults.every((r) => r.score === 0)) {
      return scoredChunks.slice(0, Math.min(chunks.length, topK));
    }

    return topResults.filter((r) => r.score > 0 || topResults.indexOf(r) < 3);
  }
}
