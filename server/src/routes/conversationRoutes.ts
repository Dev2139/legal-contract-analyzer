import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';

const router = Router();

router.post('/', ConversationController.createConversation);
router.get('/:id', ConversationController.getConversationById);

export default router;
