export interface LegalDocument {
  _id: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'docx';
  filePath: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  pageCount: number;
  error?: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPage {
  _id: string;
  documentId: string;
  pageNumber: number;
  text: string;
  normalizedText: string;
  startCharIndex: number;
  endCharIndex: number;
}

export interface DocumentChunk {
  _id: string;
  documentId: string;
  pageNumber: number;
  chunkIndex: number;
  section: string;
  text: string;
  normalizedText: string;
}

export interface Citation {
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

export interface Message {
  _id?: string;
  conversationId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  createdAt?: string;
}

export interface ContractChange {
  section: string;
  changeType: 'added' | 'removed' | 'modified';
  oldText: string;
  newText: string;
  summary: string;
  significance: 'high' | 'medium' | 'low';
}

export interface ComparisonResult {
  _id: string;
  documentA: string;
  documentB: string;
  summary: string;
  changes: ContractChange[];
  createdAt: string;
}

export interface ResearchStep {
  stepNumber: number;
  tool: string;
  query: string;
  result: string;
  timestamp: string;
}

export interface ResearchRun {
  _id: string;
  documentIds: string[];
  question: string;
  researchSteps: ResearchStep[];
  finalAnswer: string;
  citations: Citation[];
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
}
