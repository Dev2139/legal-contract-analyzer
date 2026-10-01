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
   * Enhanced Lexical Retrieval with Legal Synonym Expansion & Keyword BM25 Scoring.
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

    // Legal domain synonym dictionary for query expansion
    const legalSynonyms: Record<string, string[]> = {
      liability: ['liability', 'cap', 'limit', 'aggregate', 'indemnity', 'damages', 'maximum'],
      termination: ['terminate', 'termination', 'cancel', 'notice', 'convenience', 'breach', 'cure'],
      payment: ['payment', 'fee', 'retainer', 'invoice', 'due', 'interest', 'compensation'],
      governing: ['governing', 'law', 'jurisdiction', 'court', 'dispute', 'laws'],
      confidentiality: ['confidential', 'disclosure', 'secret', 'proprietary', 'non-disclosure'],
    };

    // Expand search terms
    const expandedTokens = new Set<string>(queryTokens);
    for (const qToken of queryTokens) {
      for (const [key, synonyms] of Object.entries(legalSynonyms)) {
        if (qToken.includes(key) || key.includes(qToken)) {
          synonyms.forEach((syn) => expandedTokens.add(syn));
        }
      }
    }

    const searchTerms = Array.from(expandedTokens);

    // Compute relevance scores
    const scoredChunks: RetrievedChunk[] = chunks.map((c) => {
      const docName = (c.documentId as any)?.originalName || 'Contract';
      const chunkTextClean = cleanText(c.text);
      const sectionClean = cleanText(c.section);

      let score = 0;

      for (const token of searchTerms) {
        // Body occurrence match
        const regex = new RegExp(`\\b${token}\\b`, 'g');
        const matches = (chunkTextClean.match(regex) || []).length;

        if (matches > 0) {
          score += (1 + Math.log(matches)) * 3;
        } else if (chunkTextClean.includes(token)) {
          score += 1.5;
        }

        // Header match boost
        if (sectionClean.includes(token)) {
          score += 6;
        }
      }

      // Exact phrase match bonus
      if (cleanQuery.length > 4 && chunkTextClean.includes(cleanQuery)) {
        score += 15;
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

    // Return top matching chunks or fallback to initial chunks if query is broad
    const topResults = scoredChunks.slice(0, topK);
    if (topResults.every((r) => r.score === 0)) {
      return scoredChunks.slice(0, Math.min(chunks.length, topK));
    }

    return topResults.filter((r) => r.score > 0 || topResults.indexOf(r) < 3);
  }
}
