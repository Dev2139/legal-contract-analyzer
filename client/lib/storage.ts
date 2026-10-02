import { LegalDocument, DocumentPage, DocumentChunk, ComparisonResult, ResearchRun } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'lexi_contracts_v1',
  PAGES: 'lexi_pages_v1',
  CHUNKS: 'lexi_chunks_v1',
  COMPARISONS: 'lexi_comparisons_v1',
  RESEARCH: 'lexi_research_v1',
  AI_CONFIG: 'lexi_ai_config_v1',
};

// Initial sample contracts preloaded for instant use without needing to upload
const DEFAULT_SAMPLE_DOCS: LegalDocument[] = [
  {
    _id: 'doc-msa-v1',
    filename: 'Master_Service_Agreement_V1.txt',
    originalName: 'Master Service Agreement (V1 - Original)',
    fileType: 'docx',
    filePath: '',
    status: 'ready',
    pageCount: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    extractedText: `MASTER SERVICES AGREEMENT (V1)

Section 1. Definitions and Scope
1.1 "Services" refers to cloud application development, system architecture, and maintenance provided by Supplier to Customer.
1.2 "Fees" refers to all compensation, milestone disbursements, and retainers payable under this Agreement.

Section 2. Compensation & Payment Terms
2.1 Customer shall pay Supplier an annual retainer fee of AED 500,000 payable quarterly in advance within 30 days of invoice.
2.2 Late payments shall accrue interest at 1.5% per month or the maximum rate permitted by law.
2.3 All expenses exceeding AED 5,000 require prior written authorization from Customer.

Section 3. Liability and Limitation
3.1 Maximum aggregate liability of Supplier under this Agreement shall be strictly capped at AED 1,000,000 or total fees paid in the preceding 12 months, whichever is lower.
3.2 In no event shall either party be liable for indirect, consequential, special, or punitive damages.

Section 4. Termination & Notice
4.1 Either party may terminate this Agreement for convenience by providing at least 60 days written notice to the other party.
4.2 In the event of a material breach, the non-breaching party may terminate immediately upon written notice if uncured after 15 days.

Section 5. Confidentiality & Non-Disclosure
5.1 Receiving Party agrees to maintain strictly confidential all proprietary information disclosed during the term and for 3 years following termination.

Section 6. Governing Law & Dispute Resolution
6.1 This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates.
6.2 Any dispute arising out of this Agreement shall be settled by binding arbitration in Dubai under DIAC rules.`
  },
  {
    _id: 'doc-msa-v2',
    filename: 'Master_Service_Agreement_V2.txt',
    originalName: 'Master Service Agreement (V2 - Revised)',
    fileType: 'docx',
    filePath: '',
    status: 'ready',
    pageCount: 2,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    extractedText: `MASTER SERVICES AGREEMENT (V2 - REVISED)

Section 1. Definitions and Scope
1.1 "Services" refers to enterprise cloud architecture, AI model integration, and 24/7 dedicated DevOps support provided by Supplier to Customer.
1.2 "Fees" refers to all compensation, milestone disbursements, and retainer fees payable under this Agreement.

Section 2. Compensation & Payment Terms
2.1 Customer shall pay Supplier an annual retainer fee of AED 750,000 payable monthly in advance within 15 days of invoice date.
2.2 Late payments shall accrue interest at 2.5% per month.
2.3 Supplier shall be reimbursed for all reasonable out-of-pocket expenses without prior threshold cap.

Section 3. Liability and Limitation
3.1 Maximum aggregate liability of Supplier under this Agreement shall be strictly capped at AED 2,500,000.
3.2 Uncapped liability shall apply to data breaches, IP infringement, and gross negligence.
3.3 Consequential damages are excluded except in cases of confidentiality violation.

Section 4. Termination & Notice
4.1 Either party may terminate this Agreement for convenience by providing at least 30 days written notice to the other party.
4.2 In the event of a material breach, the non-breaching party may terminate immediately upon written notice if uncured after 7 business days.

Section 5. Confidentiality & Non-Disclosure
5.1 Receiving Party agrees to maintain confidential all proprietary information for 5 years following termination.

Section 6. Governing Law & Dispute Resolution
6.1 This Agreement shall be governed by and construed in accordance with the laws of England and Wales.
6.2 Any dispute shall be resolved through arbitration under LCIA rules in London.`
  }
];

export interface StoredAIConfig {
  provider: 'gemini' | 'openai' | 'local';
  apiKey: string;
  model: string;
}

export class ClientStorage {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public static getAIConfig(): StoredAIConfig {
    if (!this.isBrowser()) {
      return { provider: 'local', apiKey: '', model: '' };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse AI config:', e);
    }

    // Default to env key if configured
    const envGemini = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const envOpenAI = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

    if (envGemini) {
      return { provider: 'gemini', apiKey: envGemini, model: 'gemini-1.5-flash' };
    }
    if (envOpenAI) {
      return { provider: 'openai', apiKey: envOpenAI, model: 'gpt-4o-mini' };
    }

    return { provider: 'local', apiKey: '', model: 'Local Intelligence Engine' };
  }

  public static saveAIConfig(config: StoredAIConfig): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
  }

  public static getDocuments(): LegalDocument[] {
    if (!this.isBrowser()) return DEFAULT_SAMPLE_DOCS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!raw) {
        // Initialize with default sample documents
        this.saveDocuments(DEFAULT_SAMPLE_DOCS);
        this.initDefaultPagesAndChunks();
        return DEFAULT_SAMPLE_DOCS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load documents from storage:', e);
      return DEFAULT_SAMPLE_DOCS;
    }
  }

  public static saveDocuments(docs: LegalDocument[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  }

  public static addDocument(doc: LegalDocument): void {
    const docs = this.getDocuments();
    const updated = [doc, ...docs.filter((d) => d._id !== doc._id)];
    this.saveDocuments(updated);
  }

  public static removeDocument(id: string): void {
    const docs = this.getDocuments();
    const updated = docs.filter((d) => d._id !== id);
    this.saveDocuments(updated);

    // Also remove pages and chunks
    const allPages = this.getAllPages();
    delete allPages[id];
    this.saveAllPages(allPages);

    const allChunks = this.getAllChunks();
    delete allChunks[id];
    this.saveAllChunks(allChunks);
  }

  public static getAllPages(): Record<string, DocumentPage[]> {
    if (!this.isBrowser()) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PAGES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static saveAllPages(pagesMap: Record<string, DocumentPage[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pagesMap));
  }

  public static getDocumentPages(docId: string): DocumentPage[] {
    const allPages = this.getAllPages();
    if (allPages[docId]) return allPages[docId];

    // Check if doc exists and create pages if needed
    const doc = this.getDocuments().find((d) => d._id === docId);
    if (doc && doc.extractedText) {
      const pages = this.generatePagesFromText(doc._id, doc.extractedText);
      allPages[docId] = pages;
      this.saveAllPages(allPages);
      return pages;
    }
    return [];
  }

  public static getAllChunks(): Record<string, DocumentChunk[]> {
    if (!this.isBrowser()) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHUNKS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public static saveAllChunks(chunksMap: Record<string, DocumentChunk[]>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CHUNKS, JSON.stringify(chunksMap));
  }

  public static getDocumentChunks(docId: string): DocumentChunk[] {
    const allChunks = this.getAllChunks();
    if (allChunks[docId]) return allChunks[docId];

    // Generate chunks if pages exist
    const pages = this.getDocumentPages(docId);
    if (pages.length > 0) {
      const chunks = this.generateChunksFromPages(docId, pages);
      allChunks[docId] = chunks;
      this.saveAllChunks(allChunks);
      return chunks;
    }
    return [];
  }

  public static generatePagesFromText(docId: string, text: string): DocumentPage[] {
    // Split into ~1200 character logical pages keeping paragraph boundaries
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const pages: DocumentPage[] = [];
    let currentPageText = '';
    let pageNumber = 1;
    let charOffset = 0;

    for (const p of paragraphs) {
      if (currentPageText.length + p.length > 1200 && currentPageText.length > 0) {
        pages.push({
          _id: `${docId}-p-${pageNumber}`,
          documentId: docId,
          pageNumber,
          text: currentPageText.trim(),
          normalizedText: currentPageText.toLowerCase().replace(/\s+/g, ' ').trim(),
          startCharIndex: charOffset,
          endCharIndex: charOffset + currentPageText.length,
        });
        charOffset += currentPageText.length;
        currentPageText = '';
        pageNumber++;
      }
      currentPageText += (currentPageText ? '\n\n' : '') + p.trim();
    }

    if (currentPageText.trim().length > 0 || pages.length === 0) {
      pages.push({
        _id: `${docId}-p-${pageNumber}`,
        documentId: docId,
        pageNumber,
        text: currentPageText.trim(),
        normalizedText: currentPageText.toLowerCase().replace(/\s+/g, ' ').trim(),
        startCharIndex: charOffset,
        endCharIndex: charOffset + currentPageText.length,
      });
    }

    return pages;
  }

  public static generateChunksFromPages(docId: string, pages: DocumentPage[]): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (const p of pages) {
      const paragraphs = p.text.split(/\n\s*\n/).filter((para) => para.trim().length > 0);
      let currentSection = 'General Provisions';

      for (const para of paragraphs) {
        const trimmed = para.trim();
        const headerMatch = trimmed.match(/^(Section\s+\d+[^.\n]*|Article\s+\d+[^.\n]*|Clause\s+\d+[^.\n]*|[A-Z\s]{4,35})/i);
        if (headerMatch) {
          currentSection = headerMatch[0].trim();
        }

        chunks.push({
          _id: `${docId}-c-${chunkIndex}`,
          documentId: docId,
          pageNumber: p.pageNumber,
          chunkIndex,
          section: currentSection,
          text: trimmed,
          normalizedText: trimmed.toLowerCase().replace(/\s+/g, ' ').trim(),
        });
        chunkIndex++;
      }
    }

    return chunks;
  }

  private static initDefaultPagesAndChunks(): void {
    const allPages: Record<string, DocumentPage[]> = {};
    const allChunks: Record<string, DocumentChunk[]> = {};

    for (const doc of DEFAULT_SAMPLE_DOCS) {
      if (doc.extractedText) {
        const pages = this.generatePagesFromText(doc._id, doc.extractedText);
        allPages[doc._id] = pages;
        allChunks[doc._id] = this.generateChunksFromPages(doc._id, pages);
      }
    }

    this.saveAllPages(allPages);
    this.saveAllChunks(allChunks);
  }
}
