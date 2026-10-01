import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentPage extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  pageNumber: number;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
}

const DocumentPageSchema = new Schema<IDocumentPage>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    pageNumber: { type: Number, required: true },
    text: { type: String, required: true },
    normalizedText: { type: String, required: true },
    startCharIndex: { type: Number, default: 0 },
    endCharIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DocumentPageSchema.index({ documentId: 1, pageNumber: 1 });

export const DocumentPageModel = mongoose.model<IDocumentPage>('DocumentPage', DocumentPageSchema);
