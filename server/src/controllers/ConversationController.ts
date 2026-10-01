import { Request, Response } from 'express';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';

export class ConversationController {
  public static async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { documentIds, title } = req.body;
      const conversation = await ConversationModel.create({
        documentIds: documentIds || [],
        title: title || 'Contract Analysis Chat',
      });
      res.status(201).json(conversation);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create conversation' });
    }
  }

  public static async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const conversation = await ConversationModel.findById(req.params.id).populate('documentIds');
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      const messages = await MessageModel.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
      res.json({ conversation, messages });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch conversation' });
    }
  }
}
