import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ICitationData {
  documentId: string;
  documentName?: string;
  quote: string;
  verified: boolean;
  page: number;
  startLocation: number;
  endLocation: number;
  section?: string;
  confidence?: number;
  reasoning?: string;
}

export interface IMessage extends MongooseDocument {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: ICitationData[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    citations: [
      {
        documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
        documentName: { type: String },
        quote: { type: String, required: true },
        verified: { type: Boolean, default: false },
        page: { type: Number, default: 1 },
        startLocation: { type: Number, default: 0 },
        endLocation: { type: Number, default: 0 },
        section: { type: String },
        confidence: { type: Number, default: 1.0 },
        reasoning: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
