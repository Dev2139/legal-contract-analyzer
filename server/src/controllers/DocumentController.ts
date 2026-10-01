import { Request, Response } from 'express';
import { DocumentService } from '../services/documents/DocumentService';

export class DocumentController {
  public static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded. Please upload a PDF or DOCX file.' });
        return;
      }
      const doc = await DocumentService.createDocument(req.file);
      res.status(201).json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to upload document' });
    }
  }

  public static async getAllDocuments(_req: Request, res: Response): Promise<void> {
    try {
      const docs = await DocumentService.getAllDocuments();
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch documents' });
    }
  }

  public static async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const doc = await DocumentService.getDocumentById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch document' });
    }
  }

  public static async getDocumentPages(req: Request, res: Response): Promise<void> {
    try {
      const pages = await DocumentService.getDocumentPages(req.params.id);
      res.json(pages);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch document pages' });
    }
  }

  public static async getDocumentChunks(req: Request, res: Response): Promise<void> {
    try {
      const chunks = await DocumentService.getDocumentChunks(req.params.id);
      res.json(chunks);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch document chunks' });
    }
  }

  public static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const success = await DocumentService.deleteDocument(req.params.id);
      if (!success) {
        res.status(404).json({ error: 'Document not found or already deleted' });
        return;
      }
      res.json({ message: 'Document deleted successfully', id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete document' });
    }
  }
}
