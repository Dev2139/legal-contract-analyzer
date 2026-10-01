import fs from 'fs';
import { DocumentModel, IDocument } from '../../models/Document';
import { DocumentPageModel } from '../../models/DocumentPage';
import { DocumentChunkModel } from '../../models/DocumentChunk';
import { DocumentProcessingService } from './DocumentProcessingService';

export class DocumentService {
  public static async createDocument(file: Express.Multer.File): Promise<IDocument> {
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    const fileType: 'pdf' | 'docx' = fileExt === 'docx' ? 'docx' : 'pdf';

    const doc = await DocumentModel.create({
      filename: file.filename,
      originalName: file.originalname,
      fileType,
      filePath: file.path,
      status: 'processing',
    });

    // Run async processing
    DocumentProcessingService.processDocument(doc._id.toString()).catch((err) => {
      console.error(`Async background processing error for doc ${doc._id}:`, err);
    });

    return doc;
  }

  public static async getAllDocuments(): Promise<IDocument[]> {
    return DocumentModel.find().sort({ createdAt: -1 });
  }

  public static async getDocumentById(id: string): Promise<IDocument | null> {
    return DocumentModel.findById(id);
  }

  public static async getDocumentPages(id: string) {
    return DocumentPageModel.find({ documentId: id }).sort({ pageNumber: 1 });
  }

  public static async getDocumentChunks(id: string) {
    return DocumentChunkModel.find({ documentId: id }).sort({ chunkIndex: 1 });
  }

  public static async deleteDocument(id: string): Promise<boolean> {
    const doc = await DocumentModel.findById(id);
    if (!doc) return false;

    // Delete local file if exists
    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn(`Failed to delete file ${doc.filePath}:`, err);
      }
    }

    await DocumentPageModel.deleteMany({ documentId: id });
    await DocumentChunkModel.deleteMany({ documentId: id });
    await DocumentModel.findByIdAndDelete(id);

    return true;
  }
}
