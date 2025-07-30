
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const sendMessageValidator = [
  body('receiverId')
    .notEmpty().withMessage('Receiver ID is required')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid receiver ID'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
];

export const conversationIdValidator = [
  param('conversationId')
    .notEmpty().withMessage('Conversation ID is required')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid conversation ID')
];

export const messageQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];