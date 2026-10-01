import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  pageNumber: number;
  chunkIndex: number;
  section: string;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    pageNumber: { type: Number, required: true },
    chunkIndex: { type: Number, required: true },
    section: { type: String, default: 'General' },
    text: { type: String, required: true },
    normalizedText: { type: String, required: true },
    startCharIndex: { type: Number, default: 0 },
    endCharIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
DocumentChunkSchema.index({ text: 'text' });

export const DocumentChunkModel = mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
