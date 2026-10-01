import { Request, Response } from 'express';
import { ComparisonService } from '../services/comparison/ComparisonService';

export class ComparisonController {
  public static async compareDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { documentA, documentB } = req.body;
      if (!documentA || !documentB) {
        res.status(400).json({ error: 'Both documentA and documentB IDs are required for comparison' });
        return;
      }
      if (documentA === documentB) {
        res.status(400).json({ error: 'Please select two different documents to compare' });
        return;
      }

      const comparison = await ComparisonService.compareDocuments(documentA, documentB);
      res.json(comparison);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Contract comparison failed' });
    }
  }
}
