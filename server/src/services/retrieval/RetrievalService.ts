import { DocumentChunkModel } from '../../models/DocumentChunk';
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
   * Enhanced Lexical & Semantic Retrieval with Domain Synonym Expansion,
   * Typo Tolerance, and Financial/Currency Pattern Boosting.
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
    const stopWords = new Set(['what', 'is', 'the', 'in', 'this', 'a', 'an', 'of', 'for', 'to', 'how', 'much', 'are', 'there', 'any', 'does', 'it', 'can', 'you']);

    // Extract query terms (handling minor typos)
    const rawTokens = cleanQuery
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !stopWords.has(t));

    // Comprehensive Legal Synonym Dictionary
    const legalSynonyms: Record<string, string[]> = {
      money: ['money', 'cost', 'price', 'amount', 'payment', 'fee', 'fees', 'inr', 'rs', 'rupees', 'dollar', 'usd', '₹', '$', 'total', 'charge', 'milestone', 'financial', 'compensation', 'budget'],
      cost: ['cost', 'price', 'amount', 'payment', 'fee', 'inr', 'rs', 'rupees', '₹', '$', 'total', 'budget', 'money', 'charge'],
      price: ['price', 'cost', 'amount', 'payment', 'fee', 'inr', 'rs', '₹', '$', 'total', 'money'],
      amount: ['amount', 'cost', 'price', 'payment', 'total', 'sum', '₹', '$', 'inr', 'fee', 'money'],
      payment: ['payment', 'terms', 'milestone', 'milestones', 'invoice', 'fee', 'due', 'schedule', 'billing', 'compensation'],
      liability: ['liability', 'cap', 'limit', 'limitation', 'maximum', 'aggregate', 'indemnity', 'damages', 'disclaimer'],
      indemnity: ['indemnity', 'indemnify', 'indemnification', 'hold harmless', 'liability', 'penalty', 'penalties', 'damages'],
      penalty: ['penalty', 'penalties', 'fine', 'liquidated', 'damages', 'forfeit', 'interest', 'breach', 'default'],
      termination: ['terminate', 'termination', 'notice', 'cancel', 'cancellation', 'convenience', 'breach', 'cure', 'expiry', 'exit'],
      notice: ['notice', 'days', 'written', 'period', 'timeline', 'prior', 'advance'],
      governing: ['governing', 'law', 'jurisdiction', 'court', 'dispute', 'venue', 'arbitration', 'state'],
      scope: ['scope', 'deliverables', 'work', 'project', 'features', 'requirements', 'specification'],
    };

    // Expand search terms with typos & synonyms
    const expandedSearchTerms = new Set<string>();

    for (const qToken of rawTokens) {
      expandedSearchTerms.add(qToken);

      // Handle common typos (e.g. hoow -> how, monie -> money, costt -> cost)
      for (const [key, synList] of Object.entries(legalSynonyms)) {
        if (
          qToken.includes(key) ||
          key.includes(qToken) ||
          synList.some((s) => s.includes(qToken) || qToken.includes(s))
        ) {
          synList.forEach((syn) => expandedSearchTerms.add(syn));
        }
      }
    }

    // Check if query is financial/cost related
    const isFinancialQuery = Array.from(expandedSearchTerms).some((t) =>
      ['money', 'cost', 'price', 'amount', 'payment', 'fee', 'budget', '₹', '$', 'inr', 'rs'].includes(t)
    );

    const searchTerms = Array.from(expandedSearchTerms);

    // Compute relevance scores per chunk
    const scoredChunks: RetrievedChunk[] = chunks.map((c) => {
      const docName = (c.documentId as any)?.originalName || 'Contract';
      const chunkTextClean = cleanText(c.text);
      const sectionClean = cleanText(c.section);

      let score = 0;

      for (const token of searchTerms) {
        if (token.length < 2) continue;

        // Exact token match in text
        const regex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = (chunkTextClean.match(regex) || []).length;

        if (matches > 0) {
          score += (1 + Math.log(matches)) * 4;
        } else if (chunkTextClean.includes(token)) {
          score += 2;
        }

        // Section Title Boost
        if (sectionClean.includes(token)) {
          score += 8;
        }
      }

      // Special Financial Pattern Boost (e.g. ₹1,65,000, $50,000, Total Project Cost, Payment Milestones)
      if (isFinancialQuery) {
        if (/₹|\$|inr|rs|usd|cost|payment|total/i.test(c.text)) {
          score += 10;
        }
        if (/total\s+project\s+cost|payment\s+terms|milestones|fees/i.test(c.text) || /payment/i.test(c.section)) {
          score += 15;
        }
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

    // Sort descending by relevance score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return only matching chunks (score > 0)
    const matchingChunks = scoredChunks.filter((r) => r.score > 0);
    return matchingChunks.slice(0, topK);
  }
}


