import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IConversation extends MongooseDocument {
  documentIds: mongoose.Types.ObjectId[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    title: { type: String, default: 'Contract Analysis Chat' },
  },
  { timestamps: true }
);

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
