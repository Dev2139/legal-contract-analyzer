import { Router } from 'express';
import { ResearchController } from '../controllers/ResearchController';

const router = Router();

router.post('/', ResearchController.runResearch);

export default router;
