import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'docx';
  filePath: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  pageCount: number;
  error?: string;
  extractedText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
    },
    pageCount: { type: Number, default: 0 },
    error: { type: String },
    extractedText: { type: String },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
