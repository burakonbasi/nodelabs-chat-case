
import messageService from '../services/messageService.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;
    
    const result = await messageService.createMessage(
      senderId,
      receiverId,
      content
    );
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    const result = await messageService.getConversations(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;
    
    const result = await messageService.getMessages(
      conversationId,
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const searchMessages = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const result = await messageService.searchMessages(
      userId,
      q,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await messageService.markAsRead(messageId, userId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already read'
      });
    }
    
    res.json({
      success: true,
      message: 'Message marked as read',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};