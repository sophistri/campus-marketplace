import { Router } from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} from '../controllers/conversations.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate); // every conversation route requires login

router.get('/', getConversations);
router.post('/', startConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;