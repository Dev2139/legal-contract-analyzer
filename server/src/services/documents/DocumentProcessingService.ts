import path from 'path';
import { DocumentModel, IDocument } from '../../models/Document';
import { DocumentPageModel } from '../../models/DocumentPage';
import { DocumentChunkModel } from '../../models/DocumentChunk';
import { PdfExtractionService } from './PdfExtractionService';
import { DocxExtractionService } from './DocxExtractionService';
import { ChunkingService } from './ChunkingService';
import { normalizeString } from '../../utils/normalizeText';

export class DocumentProcessingService {
  /**
   * Asynchronously processes an uploaded PDF or DOCX contract.
   */
  public static async processDocument(documentId: string): Promise<IDocument> {
    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    try {
      doc.status = 'processing';
      await doc.save();

      let extractedResult;
      const fileExt = path.extname(doc.originalName).toLowerCase();

      if (fileExt === '.pdf' || doc.fileType === 'pdf') {
        extractedResult = await PdfExtractionService.extractPdf(doc.filePath);
      } else if (fileExt === '.docx' || doc.fileType === 'docx') {
        extractedResult = await DocxExtractionService.extractDocx(doc.filePath);
      } else {
        throw new Error('Unsupported file format. Please upload PDF or DOCX.');
      }

      // Check for scanned / empty text
      if (extractedResult.isScannedOrEmpty) {
        doc.status = 'failed';
        doc.error = 'This PDF does not contain readable text. Please upload a text-based PDF or DOCX.';
        await doc.save();
        return doc;
      }

      doc.pageCount = extractedResult.pageCount;
      doc.extractedText = extractedResult.fullText;

      // Save DocumentPages
      await DocumentPageModel.deleteMany({ documentId: doc._id });
      const pageDocs = extractedResult.pages.map((p) => ({
        documentId: doc._id,
        pageNumber: p.pageNumber,
        text: p.text,
        normalizedText: normalizeString(p.text),
      }));
      await DocumentPageModel.insertMany(pageDocs);

      // Create and save DocumentChunks
      const chunkResults = ChunkingService.chunkPages(extractedResult.pages);
      await DocumentChunkModel.deleteMany({ documentId: doc._id });

      const chunkDocs = chunkResults.map((c) => ({
        documentId: doc._id,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        section: c.section,
        text: c.text,
        normalizedText: c.normalizedText,
        startCharIndex: c.startCharIndex,
        endCharIndex: c.endCharIndex,
      }));
      await DocumentChunkModel.insertMany(chunkDocs);

      doc.status = 'ready';
      doc.error = undefined;
      await doc.save();

      return doc;
    } catch (err: any) {
      console.error(`Document processing failed for ${documentId}:`, err);
      doc.status = 'failed';
      doc.error = err.message || 'Processing failed due to an internal error.';
      await doc.save();
      return doc;
    }
  }
}
