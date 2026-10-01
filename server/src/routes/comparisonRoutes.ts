import { Router } from 'express';
import { ComparisonController } from '../controllers/ComparisonController';

const router = Router();

router.post('/', ComparisonController.compareDocuments);

export default router;
