import { Request, Response } from 'express';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { RetrievalService } from '../services/retrieval/RetrievalService';
import { AIService } from '../services/ai/AIService';

export class ChatController {
  public static async streamChat(req: Request, res: Response): Promise<void> {
    const { documentIds, conversationId, message } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({ error: 'Please provide at least one document ID' });
      return;
    }
    if (!message || message.trim() === '') {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    let convId = conversationId;
    if (!convId) {
      const conv = await ConversationModel.create({
        documentIds,
        title: message.slice(0, 40) + '...',
      });
      convId = conv._id.toString();
    }

    // Save user message to database
    await MessageModel.create({
      conversationId: convId,
      role: 'user',
      content: message,
      citations: [],
    });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const abortController = new AbortController();
    let isClientConnected = true;

    req.on('close', () => {
      isClientConnected = false;
      abortController.abort();
    });

    // Send init SSE
    res.write(`event: init\ndata: ${JSON.stringify({ conversationId: convId })}\n\n`);

    try {
      // Step 1: Lexical retrieval
      const relevantChunks = await RetrievalService.retrieveRelevantChunks(documentIds, message, 8);

      // Step 2: Stream AI completion
      const result = await AIService.streamChatResponse(
        message,
        relevantChunks,
        (textChunk) => {
          if (isClientConnected) {
            res.write(`event: chunk\ndata: ${JSON.stringify({ content: textChunk })}\n\n`);
          }
        },
        abortController.signal
      );

      // Save assistant message to DB with verified citations
      const assistantMessage = await MessageModel.create({
        conversationId: convId,
        role: 'assistant',
        content: result.answer,
        citations: result.citations,
      });

      if (isClientConnected) {
        res.write(
          `event: done\ndata: ${JSON.stringify({
            messageId: assistantMessage._id,
            conversationId: convId,
            answer: result.answer,
            citations: result.citations,
          })}\n\n`
        );
        res.end();
      }
    } catch (err: any) {
      console.error('Error during streaming chat:', err);
      if (isClientConnected) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
        res.end();
      }
    }
  }
}
