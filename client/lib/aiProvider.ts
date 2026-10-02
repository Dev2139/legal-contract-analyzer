import { ClientStorage, StoredAIConfig } from './storage';
import { ClientLegalEngine, RetrievedChunk } from './clientLegalEngine';
import { Citation } from '../types';

export interface StreamChatResult {
  answer: string;
  citations: Citation[];
}

export class AIProviderService {
  /**
   * Tests API Key connection directly from the browser
   */
  public static async testConnection(config: StoredAIConfig): Promise<{ success: boolean; message: string }> {
    if (config.provider === 'local') {
      return { success: true, message: 'Built-in Local Smart Intelligence Engine is ready.' };
    }

    if (!config.apiKey || !config.apiKey.trim()) {
      return { success: false, message: 'Please enter an API Key.' };
    }

    try {
      if (config.provider === 'gemini') {
        const model = config.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello, respond with: OK' }] }],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${res.status}`);
        }
        return { success: true, message: `Successfully connected to Google Gemini (${model})!` };
      }

      if (config.provider === 'openai') {
        const model = config.model || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Respond with: OK' }],
            max_tokens: 5,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${res.status}`);
        }
        return { success: true, message: `Successfully connected to OpenAI (${model})!` };
      }

      return { success: true, message: 'Ready.' };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  }

  /**
   * Streams chat completion with contract evidence grounding & citation extraction
   */
  public static async streamChat(
    query: string,
    chunks: RetrievedChunk[],
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<StreamChatResult> {
    const config = ClientStorage.getAIConfig();

    // Prepare retrieved evidence
    const contextText = chunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1} | Document: ${c.documentName} | Page: ${c.pageNumber} | Section: ${c.section}]\n${c.text}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are an elite legal contract analyst. Answer the user's question directly, concisely, and with executive clarity.

GUIDELINES:
1. Provide a direct, plain-English summary answer in your very first paragraph.
2. Ground your answer strictly on the supplied contract evidence below.
3. Support all key findings with exact quotations inside double quotes (e.g. "Total liability shall not exceed...").
4. If no relevant evidence is found, explicitly state: "I could not find relevant evidence in the document."

CONTRACT EVIDENCE:
${contextText || 'No contract text found.'}

USER QUESTION:
${query}`;

    let fullAnswer = '';

    // Check if user has an active Gemini or OpenAI API Key
    if (config.provider === 'gemini' && config.apiKey) {
      try {
        fullAnswer = await this.streamGemini(config, systemPrompt, onChunk, signal);
      } catch (e: any) {
        console.warn('Gemini API call failed, falling back to local reasoning:', e.message);
        return await ClientLegalEngine.generateLocalAnswer(query, chunks, onChunk, signal);
      }
    } else if (config.provider === 'openai' && config.apiKey) {
      try {
        fullAnswer = await this.streamOpenAI(config, systemPrompt, onChunk, signal);
      } catch (e: any) {
        console.warn('OpenAI API call failed, falling back to local reasoning:', e.message);
        return await ClientLegalEngine.generateLocalAnswer(query, chunks, onChunk, signal);
      }
    } else {
      // Local fallback reasoning engine
      return await ClientLegalEngine.generateLocalAnswer(query, chunks, onChunk, signal);
    }

    // Extract double-quoted strings from full answer
    const rawQuotes: { documentId: string; quote: string }[] = [];
    const quoteMatches = fullAnswer.match(/"([^"]{10,250})"/g) || [];

    for (const qMatch of quoteMatches) {
      const cleanQuote = qMatch.replace(/^"|"$/g, '').trim();
      const matchingChunk = chunks.find((c) => c.text.includes(cleanQuote) || cleanQuote.includes(c.section));
      const targetDocId = matchingChunk ? matchingChunk.documentId : chunks[0]?.documentId;

      if (targetDocId) {
        rawQuotes.push({ documentId: targetDocId, quote: cleanQuote });
      }
    }

    if (rawQuotes.length === 0 && chunks.length > 0 && chunks[0].score > 0) {
      const sentences = chunks[0].text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
      if (sentences.length > 0) {
        rawQuotes.push({ documentId: chunks[0].documentId, quote: sentences[0].trim() });
      }
    }

    const citations = ClientLegalEngine.verifyQuotes(rawQuotes);
    return { answer: fullAnswer, citations };
  }

  private static async streamGemini(
    config: StoredAIConfig,
    prompt: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const model = config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${config.apiKey.trim()}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No readable stream');
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr);
              const textPiece = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (textPiece) {
                fullText += textPiece;
                onChunk(textPiece);
              }
            } catch (err) {
              // Ignore partial JSON
            }
          }
        }
      }
    }

    return fullText;
  }

  private static async streamOpenAI(
    config: StoredAIConfig,
    prompt: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const model = config.model || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.1,
      }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No readable stream');
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr);
              const textPiece = parsed.choices?.[0]?.delta?.content || '';
              if (textPiece) {
                fullText += textPiece;
                onChunk(textPiece);
              }
            } catch (err) {
              // Ignore partial JSON
            }
          }
        }
      }
    }

    return fullText;
  }
}
