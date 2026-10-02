import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { DocumentController } from '../controllers/DocumentController';

// Use /tmp in serverless environments (Vercel), regular uploads/ dir locally
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadsDir = isServerless ? os.tmpdir() : path.resolve(__dirname, '../../uploads');

if (!isServerless && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
