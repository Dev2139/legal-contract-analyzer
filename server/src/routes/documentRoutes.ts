import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { DocumentController } from '../controllers/DocumentController';

// Always use the OS temp directory for uploads.
// Uploaded files are temporary — text is extracted into MongoDB then the file is no longer needed.
// This avoids read-only filesystem errors on serverless platforms (Vercel, AWS Lambda).
const uploadsDir = os.tmpdir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max size
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and DOCX files are allowed.'));
    }
  },
});

const router = Router();

router.post('/', upload.single('file'), DocumentController.uploadDocument);
router.get('/', DocumentController.getAllDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.delete('/:id', DocumentController.deleteDocument);
router.get('/:id/pages', DocumentController.getDocumentPages);
router.get('/:id/chunks', DocumentController.getDocumentChunks);

export default router;
