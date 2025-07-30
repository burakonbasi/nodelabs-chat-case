import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import {
  sendMessageValidator,
  conversationIdValidator,
  messageQueryValidator,
  messageIdValidator
} from '../validators/message.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send message
router.post(
  '/send',
  sendMessageValidator,
  validateRequest,
  messageController.sendMessage
);

// Get conversations
router.get(
  '/conversations',
  messageQueryValidator,
  validateRequest,
  messageController.getConversations
);

// Create conversation
router.post(
  '/conversations/create',
  sendMessageValidator,
  validateRequest,
  messageController.createConversation
);

// Get messages in a conversation
router.get(
  '/conversations/:conversationId/messages',
  conversationIdValidator,
  messageQueryValidator,
  validateRequest,
  messageController.getMessages
);

// Delete conversation
router.delete(
  '/conversations/:conversationId',
  conversationIdValidator,
  validateRequest,
  messageController.deleteConversation
);

// Update the old route to new format
router.get(
  '/conversations/:conversationId',
  conversationIdValidator,
  messageQueryValidator,
  validateRequest,
  messageController.getMessages
);

// Search messages
router.get(
  '/search',
  messageQueryValidator,
  validateRequest,
  messageController.searchMessages
);

// Mark message as read
router.patch(
  '/:messageId/read',
  messageIdValidator,
  validateRequest,
  messageController.markAsRead
);

// Get unread count
router.get(
  '/unread-count',
  messageController.getUnreadCount
);

export default router;