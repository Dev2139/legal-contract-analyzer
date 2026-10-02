import OpenAI from 'openai';
import { config } from '../../config/env';
import { RetrievedChunk } from '../retrieval/RetrievalService';
import { CitationVerificationService, UnverifiedQuote } from '../citations/CitationVerificationService';
import { ICitationData } from '../../models/Message';

export interface ChatStreamResponse {
  answer: string;
  citations: ICitationData[];
}

export class AIService {
  private static getOpenAIClient(): OpenAI | null {
    if (!config.openaiApiKey || config.openaiApiKey.trim() === '') {
      return null;
    }
    return new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl || undefined,
    });
  }

  /**
   * Generates a streaming contract analysis answer and verifies citations.
   */
  public static async streamChatResponse(
    query: string,
    chunks: RetrievedChunk[],
    onChunk: (textChunk: string) => void,
    signal?: AbortSignal
  ): Promise<ChatStreamResponse> {
    const openai = AIService.getOpenAIClient();

    // Prepare retrieved evidence context string
    const contextText = chunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1} | Document: ${c.documentName} | Page ${c.pageNumber} | Section: ${c.section}]\n${c.text}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are an executive legal contract analyst. Answer the user's question directly, clearly, and concisely.

INSTRUCTIONS:
1. Provide a direct, plain-English summary answer in your very first paragraph. Do not start with generic preamble.
2. Use bullet points for breakdown, numbers, milestones, or terms if applicable.
3. Ground your answer strictly on the supplied contract evidence below.
4. Support key findings with exact quotations inside double quotes.
5. If the evidence does not answer the question, state: "I could not find relevant evidence in the document to answer this question."

CONTRACT EVIDENCE:
${contextText || 'No contract text found.'}

USER QUESTION:
${query}`;

    let fullAnswer = '';
    const rawQuotes: UnverifiedQuote[] = [];

    if (openai) {
      try {
        const stream = await openai.chat.completions.create(
          {
            model: config.openaiModel,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            temperature: 0.1,
          },
          { signal }
        );

        for await (const chunk of stream) {
          if (signal?.aborted) break;
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullAnswer += content;
            onChunk(content);
          }
        }
      } catch (err: any) {
        console.warn('OpenAI API call failed or unconfigured, using fallback reasoning engine:', err.message);
        fullAnswer = await AIService.fallbackContractReasoning(query, chunks, onChunk, signal);
      }
    } else {
      fullAnswer = await AIService.fallbackContractReasoning(query, chunks, onChunk, signal);
    }

    // Extract quotes from answer in double quotes
    const quoteMatches = fullAnswer.match(/"([^"]{10,250})"/g) || [];
    for (const qMatch of quoteMatches) {
      const cleanQuote = qMatch.replace(/^"|"$/g, '').trim();
      const matchingChunk = chunks.find((c) => c.text.includes(cleanQuote) || cleanQuote.includes(c.section));
      const targetDocId = matchingChunk ? matchingChunk.documentId : chunks[0]?.documentId;

      if (targetDocId) {
        rawQuotes.push({ documentId: targetDocId, quote: cleanQuote });
      }
    }

    // If no explicit quotes in answer text, extract key sentence from top retrieved chunk
    if (rawQuotes.length === 0 && chunks.length > 0 && chunks[0].score > 0) {
      const sentences = chunks[0].text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
      if (sentences.length > 0) {
        rawQuotes.push({ documentId: chunks[0].documentId, quote: sentences[0].trim() });
      }
    }

    // Perform server-side deterministic verification
    const citations = await CitationVerificationService.verifyQuotes(rawQuotes);

    return {
      answer: fullAnswer,
      citations,
    };
  }

  /**
   * Executive-first local contract reasoning engine that provides direct, concise,
   * to-the-point answers with exact quote evidence when OpenAI key is absent/unreachable.
   */
  private static async fallbackContractReasoning(
    query: string,
    chunks: RetrievedChunk[],
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const validChunks = chunks.filter((c) => c.score > 0);

    if (validChunks.length === 0) {
      const msg = `I could not find any relevant clauses or evidence in the document(s) answering "${query}".`;
      for (const char of msg) {
        if (signal?.aborted) break;
        onChunk(char);
        await new Promise((r) => setTimeout(r, 8));
      }
      return msg;
    }

    const topChunk = validChunks[0];
    const cleanQ = query.toLowerCase();

    // Check query intent (money/cost, notice/termination, governing law, scope)
    const isMoneyQuery = /money|cost|price|amount|payment|fee|rupees|rs|inr|₹|\$/i.test(cleanQ);

    // Extract monetary amounts if present (e.g. ₹1,65,000, $50,000, 20%)
    const moneyMatches = topChunk.text.match(/(?:₹|\$|USD|INR|Rs\.?)\s*[\d,]+(?:\.\d+)?|\b[\d,]+\s*(?:rupees|dollars|inr|rs)\b/gi) || [];

    // Extract key sentences matching query
    const sentences = topChunk.text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
    const matchedSentence =
      sentences.find((s) => {
        const sLower = s.toLowerCase();
        return cleanQ.split(' ').some((w) => w.length > 3 && sLower.includes(w));
      }) || sentences[0] || topChunk.text.slice(0, 180);

    let directAnswer = '';

    if (isMoneyQuery && moneyMatches.length > 0) {
      directAnswer = `The total financial amount specified in **${topChunk.documentName}** is **${moneyMatches.join(', ')}** (under *${topChunk.section}*).`;
    } else {
      directAnswer = `According to **${topChunk.documentName}** (Page ${topChunk.pageNumber}, *${topChunk.section}*): ${matchedSentence.trim()}`;
    }

    const textToStream =
      `${directAnswer}\n\n` +
      `### Key Details & Clause Provisions:\n` +
      `- **Section:** ${topChunk.section} (Page ${topChunk.pageNumber})\n` +
      `- **Clause Excerpt:** "${matchedSentence.trim()}"\n` +
      (validChunks.length > 1
        ? `- **Additional Context (Page ${validChunks[1].pageNumber} - ${validChunks[1].section}):** "${validChunks[1].text.slice(0, 130).trim()}..."\n`
        : '');

    for (let i = 0; i < textToStream.length; i += 4) {
      if (signal?.aborted) break;
      const part = textToStream.slice(i, i + 4);
      onChunk(part);
      await new Promise((r) => setTimeout(r, 10));
    }

    return textToStream;
  }
}


