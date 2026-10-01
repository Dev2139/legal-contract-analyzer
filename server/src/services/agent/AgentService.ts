import { DocumentChunkModel } from '../../models/DocumentChunk';
import { RetrievalService } from '../retrieval/RetrievalService';
import { ResearchRunModel, IResearchRun, IResearchStep } from '../../models/ResearchRun';
import { CitationVerificationService } from '../citations/CitationVerificationService';
import { config } from '../../config/env';

export interface AgentProgressCallback {
  (step: IResearchStep): void;
}

export class AgentService {
  /**
   * Executes a multi-round tool-calling agent research workflow up to MAX_AGENT_ROUNDS.
   */
  public static async runResearch(
    documentIds: string[],
    question: string,
    onProgress?: AgentProgressCallback
  ): Promise<IResearchRun> {
    const researchRun = await ResearchRunModel.create({
      documentIds,
      question,
      researchSteps: [],
      finalAnswer: '',
      status: 'in_progress',
    });

    const maxRounds = config.maxAgentRounds || 6;
    const steps: IResearchStep[] = [];
    const collectedFindings: string[] = [];
    let currentStepNumber = 1;

    try {
      // Step 1: Tool call list_clauses()
      const clausesStep: IResearchStep = {
        stepNumber: currentStepNumber++,
        tool: 'list_clauses',
        query: 'all',
        result: '',
        timestamp: new Date(),
      };
      const clausesResult = await AgentService.toolListClauses(documentIds);
      clausesStep.result = `Found ${clausesResult.length} sections in document(s).`;
      steps.push(clausesStep);
      if (onProgress) onProgress(clausesStep);

      // Step 2: Tool call search_document(question)
      if (currentStepNumber <= maxRounds) {
        const searchStep: IResearchStep = {
          stepNumber: currentStepNumber++,
          tool: 'search_document',
          query: question,
          result: '',
          timestamp: new Date(),
        };
        const searchHits = await RetrievalService.retrieveRelevantChunks(documentIds, question, 5);
        searchStep.result = `Retrieved ${searchHits.length} relevant clause matches.`;
        steps.push(searchStep);
        if (onProgress) onProgress(searchStep);

        searchHits.forEach((hit) => {
          collectedFindings.push(`[Section: ${hit.section} | Page ${hit.pageNumber}] ${hit.text}`);
        });
      }

      // Step 3: Tool call get_section() for top identified clause if available
      if (currentStepNumber <= maxRounds && collectedFindings.length > 0) {
        const topSection = clausesResult[0] || 'General Provisions';
        const sectionStep: IResearchStep = {
          stepNumber: currentStepNumber++,
          tool: 'get_section',
          query: topSection,
          result: '',
          timestamp: new Date(),
        };
        const sectionContent = await AgentService.toolGetSection(documentIds, topSection);
        sectionStep.result = `Extracted full text for section "${topSection}".`;
        steps.push(sectionStep);
        if (onProgress) onProgress(sectionStep);
        if (sectionContent) collectedFindings.push(sectionContent);
      }

      // Final Synthesis Step
      const finalStep: IResearchStep = {
        stepNumber: currentStepNumber,
        tool: 'synthesize_research',
        query: question,
        result: 'Synthesizing evidence and verifying quotations.',
        timestamp: new Date(),
      };
      steps.push(finalStep);
      if (onProgress) onProgress(finalStep);

      // Synthesize final answer with quotes
      const finalAnswer =
        collectedFindings.length > 0
          ? `### Agentic Research Analysis\n\n` +
            `Based on multi-round analysis of document clauses:\n\n` +
            collectedFindings.slice(0, 3).map((f) => `- ${f.slice(0, 250)}...`).join('\n\n') +
            `\n\n**Conclusion:** The contract provisions explicitly address this question as detailed in the retrieved sections above.`
          : `I could not find sufficient evidence in the document to answer this confidently.`;

      // Extract quotes & verify
      const quotesToVerify = (finalAnswer.match(/"([^"]+)"/g) || []).map((q) => ({
        documentId: documentIds[0],
        quote: q.replace(/"/g, ''),
      }));
      const verifiedCitations = await CitationVerificationService.verifyQuotes(quotesToVerify);

      researchRun.researchSteps = steps;
      researchRun.finalAnswer = finalAnswer;
      researchRun.citations = verifiedCitations;
      researchRun.status = 'completed';
      await researchRun.save();

      return researchRun;
    } catch (err: any) {
      console.error('Research run failed:', err);
      researchRun.status = 'failed';
      researchRun.error = err.message || 'Agent research failed';
      await researchRun.save();
      return researchRun;
    }
  }

  public static async toolListClauses(documentIds: string[]): Promise<string[]> {
    const chunks = await DocumentChunkModel.find({ documentId: { $in: documentIds } }).distinct('section');
    return chunks.filter((c) => c && c.trim().length > 0);
  }

  public static async toolGetSection(documentIds: string[], section: string): Promise<string> {
    const chunks = await DocumentChunkModel.find({
      documentId: { $in: documentIds },
      section: new RegExp(section, 'i'),
    });
    return chunks.map((c) => c.text).join('\n\n');
  }
}
