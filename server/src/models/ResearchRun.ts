import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IResearchStep {
  stepNumber: number;
  tool: string;
  query: string;
  result: string;
  timestamp: Date;
}

export interface IResearchRun extends MongooseDocument {
  conversationId?: mongoose.Types.ObjectId;
  documentIds: mongoose.Types.ObjectId[];
  question: string;
  researchSteps: IResearchStep[];
  finalAnswer: string;
  citations: any[];
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
}

const ResearchRunSchema = new Schema<IResearchRun>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    question: { type: String, required: true },
    researchSteps: [
      {
        stepNumber: { type: Number, required: true },
        tool: { type: String, required: true },
        query: { type: String, default: '' },
        result: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    finalAnswer: { type: String, default: '' },
    citations: [{ type: Schema.Types.Mixed }],
    status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
    error: { type: String },
  },
  { timestamps: true }
);

export const ResearchRunModel = mongoose.model<IResearchRun>('ResearchRun', ResearchRunSchema);
