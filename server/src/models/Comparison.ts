import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IContractChange {
  section: string;
  changeType: 'added' | 'removed' | 'modified';
  oldText: string;
  newText: string;
  summary: string;
  significance: 'high' | 'medium' | 'low';
}

export interface IComparison extends MongooseDocument {
  documentA: mongoose.Types.ObjectId;
  documentB: mongoose.Types.ObjectId;
  changes: IContractChange[];
  summary: string;
  createdAt: Date;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    documentA: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    documentB: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    summary: { type: String, required: true },
    changes: [
      {
        section: { type: String, required: true },
        changeType: { type: String, enum: ['added', 'removed', 'modified'], required: true },
        oldText: { type: String, default: '' },
        newText: { type: String, default: '' },
        summary: { type: String, required: true },
        significance: { type: String, enum: ['high', 'medium', 'low'], required: true },
      },
    ],
  },
  { timestamps: true }
);

export const ComparisonModel = mongoose.model<IComparison>('Comparison', ComparisonSchema);
