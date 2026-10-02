import { LegalDocument, DocumentPage, ComparisonResult, ResearchRun } from '../types';
import { ClientStorage } from './storage';
import { parseContractFile, parsePastedContract } from './textExtraction';
import { ClientLegalEngine } from './clientLegalEngine';
import { AIProviderService } from './aiProvider';

/**
 * Fetch all documents from local client storage
 */
export async function fetchDocuments(): Promise<LegalDocument[]> {
  return ClientStorage.getDocuments();
}

/**
 * Parse and store uploaded contract file directly in browser
 */
export async function uploadDocumentFile(file: File): Promise<LegalDocument> {
  return await parseContractFile(file);
}

/**
 * Save pasted contract text directly in browser
 */
export function uploadPastedContract(title: string, text: string): LegalDocument {
  return parsePastedContract(title, text);
}

/**
 * Delete a document from browser storage
 */
export async function deleteDocumentById(id: string): Promise<void> {
  ClientStorage.removeDocument(id);
}

/**
 * Fetch document pages from browser storage
 */
export async function fetchDocumentPages(id: string): Promise<DocumentPage[]> {
  return ClientStorage.getDocumentPages(id);
}

/**
 * Compare two contracts clause-by-clause client-side
 */
export async function compareTwoContracts(documentA: string, documentB: string): Promise<ComparisonResult> {
  return ClientLegalEngine.compareContracts(documentA, documentB);
}

/**
 * Streaming chat with AI API key (Gemini / OpenAI) or built-in local engine
 */
export function streamChatApi(
  documentIds: string[],
  message: string,
  conversationId: string | undefined,
  onInit: (data: { conversationId: string }) => void,
  onChunk: (chunk: string) => void,
  onDone: (data: any) => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): void {
  const convId = conversationId || `conv-${Date.now()}`;
  onInit({ conversationId: convId });

  // Retrieve relevant chunks from client storage
  const chunks = ClientLegalEngine.retrieveChunks(documentIds, message, 6);

  AIProviderService.streamChat(message, chunks, onChunk, signal)
    .then((result) => {
      onDone({
        conversationId: convId,
        answer: result.answer,
        citations: result.citations,
      });
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        // Fallback directly to local engine if stream failed
        ClientLegalEngine.generateLocalAnswer(message, chunks, onChunk, signal)
          .then((fallbackRes) => {
            onDone({
              conversationId: convId,
              answer: fallbackRes.answer,
              citations: fallbackRes.citations,
            });
          })
          .catch((e) => onError(e.message || 'Analysis error'));
      }
    });
}

/**
 * Deep agentic contract research directly in browser
 */
export function streamResearchApi(
  documentIds: string[],
  question: string,
  onStep: (step: any) => void,
  onDone: (run: ResearchRun) => void,
  onError: (err: string) => void
): void {
  try {
    ClientLegalEngine.runAgenticResearch(
      documentIds,
      question,
      onStep,
      onDone
    );
  } catch (err: any) {
    onError(err.message || 'Research failed');
  }
}
