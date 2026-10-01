import { DocumentChunkModel } from '../../models/DocumentChunk';
import { DocumentModel } from '../../models/Document';
import { ComparisonModel, IComparison, IContractChange } from '../../models/Comparison';
import { cleanText } from '../../utils/normalizeText';

export class ComparisonService {
  /**
   * Compares Document A and Document B at clause & section level to detect substantive changes.
   */
  public static async compareDocuments(docAId: string, docBId: string): Promise<IComparison> {
    const docA = await DocumentModel.findById(docAId);
    const docB = await DocumentModel.findById(docBId);

    if (!docA || !docB) {
      throw new Error('One or both documents not found for comparison');
    }

    const chunksA = await DocumentChunkModel.find({ documentId: docAId }).sort({ chunkIndex: 1 });
    const chunksB = await DocumentChunkModel.find({ documentId: docBId }).sort({ chunkIndex: 1 });

    const changes: IContractChange[] = [];

    // Map chunks by section name or index
    const sectionsAMap = new Map<string, string>();
    chunksA.forEach((c) => {
      const key = cleanText(c.section);
      sectionsAMap.set(key || `Clause ${c.chunkIndex + 1}`, c.text);
    });

    const sectionsBMap = new Map<string, string>();
    chunksB.forEach((c) => {
      const key = cleanText(c.section);
      sectionsBMap.set(key || `Clause ${c.chunkIndex + 1}`, c.text);
    });

    // Check all sections in A vs B
    for (const [secKey, textA] of sectionsAMap.entries()) {
      const displaySec = chunksA.find((c) => cleanText(c.section) === secKey)?.section || secKey;
      const textB = sectionsBMap.get(secKey);

      if (!textB) {
        // Section removed in B
        changes.push({
          section: displaySec,
          changeType: 'removed',
          oldText: textA,
          newText: '',
          summary: `Clause "${displaySec}" present in ${docA.originalName} was completely removed in ${docB.originalName}.`,
          significance: 'high',
        });
      } else if (cleanText(textA) !== cleanText(textB)) {
        // Section modified
        const sig = ComparisonService.evaluateSignificance(textA, textB);
        changes.push({
          section: displaySec,
          changeType: 'modified',
          oldText: textA,
          newText: textB,
          summary: `Substantive changes detected in "${displaySec}".`,
          significance: sig,
        });
      }
    }

    // Check sections added in B
    for (const [secKey, textB] of sectionsBMap.entries()) {
      const displaySec = chunksB.find((c) => cleanText(c.section) === secKey)?.section || secKey;
      if (!sectionsAMap.has(secKey)) {
        changes.push({
          section: displaySec,
          changeType: 'added',
          oldText: '',
          newText: textB,
          summary: `New clause "${displaySec}" added in ${docB.originalName}.`,
          significance: 'high',
        });
      }
    }

    // Fallback if section matching produced no changes (do direct paragraph diff)
    if (changes.length === 0 && (docA.extractedText !== docB.extractedText)) {
      changes.push({
        section: 'General Terms',
        changeType: 'modified',
        oldText: docA.extractedText?.slice(0, 300) || '',
        newText: docB.extractedText?.slice(0, 300) || '',
        summary: 'General phrasing and formatting modifications across contracts.',
        significance: 'medium',
      });
    }

    const overallSummary = `Contract comparison completed between ${docA.originalName} and ${docB.originalName}. Found ${changes.length} substantive clause changes.`;

    const comparison = await ComparisonModel.create({
      documentA: docA._id,
      documentB: docB._id,
      summary: overallSummary,
      changes,
    });

    return comparison;
  }

  /**
   * Evaluates the legal significance of modifications between old and new text.
   */
  private static evaluateSignificance(oldText: string, newText: string): 'high' | 'medium' | 'low' {
    const highRiskKeywords = [
      'liability', 'terminate', 'indemnity', 'payment', 'fee', 'aed', 'usd', '$',
      'governing law', 'jurisdiction', 'confidential', 'breach', 'penalty', 'cap'
    ];

    const cleanOld = oldText.toLowerCase();
    const cleanNew = newText.toLowerCase();

    // Check for number/amount changes (e.g. AED 100k -> AED 1M)
    const oldNums = cleanOld.match(/\d+[\d,.]*/g) || [];
    const newNums = cleanNew.match(/\d+[\d,.]*/g) || [];

    if (JSON.stringify(oldNums) !== JSON.stringify(newNums)) {
      return 'high';
    }

    for (const kw of highRiskKeywords) {
      if (cleanOld.includes(kw) || cleanNew.includes(kw)) {
        return 'high';
      }
    }

    if (Math.abs(oldText.length - newText.length) > 100) {
      return 'medium';
    }

    return 'low';
  }
}
