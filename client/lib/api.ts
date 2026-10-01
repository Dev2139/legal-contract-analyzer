import { LegalDocument, DocumentPage, ComparisonResult, ResearchRun } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchDocuments(): Promise<LegalDocument[]> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocumentFile(file: File): Promise<LegalDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Upload failed');
  }

  return res.json();
}

export async function deleteDocumentById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function fetchDocumentPages(id: string): Promise<DocumentPage[]> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}/pages`);
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

export async function compareTwoContracts(documentA: string, documentB: string): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE_URL}/comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentA, documentB }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Comparison failed' }));
    throw new Error(err.error || 'Comparison failed');
  }

  return res.json();
}

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
  fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentIds, message, conversationId }),
    signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        throw new Error(`Chat API error (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evtBlock of events) {
          if (!evtBlock.trim()) continue;
          const lines = evtBlock.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (eventType === 'init') onInit(data);
              else if (eventType === 'chunk') onChunk(data.content || '');
              else if (eventType === 'done') onDone(data);
              else if (eventType === 'error') onError(data.error || 'Unknown error');
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message || 'Stream connection error');
      }
    });
}

export function streamResearchApi(
  documentIds: string[],
  question: string,
  onStep: (step: any) => void,
  onDone: (run: ResearchRun) => void,
  onError: (err: string) => void
): void {
  fetch(`${API_BASE_URL}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentIds, question }),
  })
    .then(async (res) => {
      if (!res.ok || !res.body) throw new Error('Research request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evtBlock of events) {
          if (!evtBlock.trim()) continue;
          const lines = evtBlock.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (eventType === 'step') onStep(data);
              else if (eventType === 'done') onDone(data);
            } catch (e) {
              console.warn('Research SSE parse error:', e);
            }
          }
        }
      }
    })
    .catch((err) => onError(err.message || 'Research failed'));
}
