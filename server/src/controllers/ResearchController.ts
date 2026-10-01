import { Request, Response } from 'express';
import { AgentService } from '../services/agent/AgentService';

export class ResearchController {
  public static async runResearch(req: Request, res: Response): Promise<void> {
    try {
      const { documentIds, question } = req.body;
      if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
        res.status(400).json({ error: 'Please provide at least one document ID for agentic research' });
        return;
      }
      if (!question || question.trim() === '') {
        res.status(400).json({ error: 'Question is required for research' });
        return;
      }

      // Stream progress via SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const run = await AgentService.runResearch(documentIds, question, (step) => {
        res.write(`event: step\ndata: ${JSON.stringify(step)}\n\n`);
      });

      res.write(`event: done\ndata: ${JSON.stringify(run)}\n\n`);
      res.end();
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Agentic research failed' });
    }
  }
}
