import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { elasticClient } from '../config/elasticsearch.js';
import logger from '../utils/logger.js';

class MessageService {
  async createMessage(senderId, receiverId, content) {
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }
    
    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content
    });
    
    // Update conversation's last message
    conversation.lastMessage = message._id;
    
    // Update unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    
    await conversation.save();
    
    // Index in Elasticsearch if available
    if (elasticClient) {
      try {
        await elasticClient.index({
          index: 'messages',
          id: message._id.toString(),
          body: {
            conversationId: conversation._id.toString(),
            senderId: senderId.toString(),
            receiverId: receiverId.toString(),
            content,
            createdAt: message.createdAt
          }
        });
      } catch (error) {
        logger.error('Elasticsearch indexing error:', error);
      }
    }
    
    // Populate sender info
    await message.populate('senderId', 'username email');
    
    return {
      message,
      conversationId: conversation._id
    };
  }
  
  async getConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Conversation.countDocuments({
      participants: userId
    });
    
    return {
      conversations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getMessages(conversationId, userId, page = 1, limit = 50) {
    // Check if user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      conversationId
    })
    .populate('senderId', 'username email')
    .populate('receiverId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Message.countDocuments({ conversationId });
    
    // Mark messages as read
    const unreadMessages = messages.filter(
      msg => msg.receiverId._id.toString() === userId.toString() && !msg.readAt
    );
    
    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(msg => msg._id) },
          receiverId: userId
        },
        { readAt: new Date() }
      );
      
      // Reset unread count
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }
    
    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async searchMessages(userId, query, page = 1, limit = 20) {
    if (!elasticClient) {
      // Fallback to MongoDB text search
      const conversations = await Conversation.find({
        participants: userId
      }).select('_id');
      
      const conversationIds = conversations.map(c => c._id);
      
      const messages = await Message.find({
        conversationId: { $in: conversationIds },
        content: { $regex: query, $options: 'i' }
      })
      .populate('senderId', 'username email')
      .populate('receiverId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
      return { messages, source: 'mongodb' };
    }
    
    // Use Elasticsearch
    try {
      const userConversations = await Conversation.find({
        participants: userId
      }).select('_id');
      
      const conversationIds = userConversations.map(c => c._id.toString());
      
      const response = await elasticClient.search({
        index: 'messages',
        from: (page - 1) * limit,
        size: limit,
        body: {
          query: {
            bool: {
              must: [
                { match: { content: query } },
                { terms: { conversationId: conversationIds } }
              ]
            }
          },
          sort: [{ createdAt: { order: 'desc' } }]
        }
      });
      
      const messageIds = response.hits.hits.map(hit => hit._id);
      const messages = await Message.find({
        _id: { $in: messageIds }
      })
      .populate('senderId', 'username email')
      .populate('receiverId', 'username email');
      
      return { 
        messages, 
        total: response.hits.total.value,
        source: 'elasticsearch' 
      };
    } catch (error) {
      logger.error('Elasticsearch search error:', error);
      throw new Error('Search failed');
    }
  }
  
  async markAsRead(messageId, userId) {
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
        readAt: null
      },
      { readAt: new Date() },
      { new: true }
    );
    
    if (message) {
      // Update unread count in conversation
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        const currentUnread = conversation.unreadCount.get(userId.toString()) || 0;
        if (currentUnread > 0) {
          conversation.unreadCount.set(userId.toString(), currentUnread - 1);
          await conversation.save();
        }
      }
    }
    
    return message;
  }
  
  async deleteConversation(conversationId, userId) {
    // Check if user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Delete all messages in conversation
    await Message.deleteMany({ conversationId });
    
    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);
    
    logger.info(`Conversation ${conversationId} deleted by user ${userId}`);
  }
  
  async getUnreadCount(userId) {
    const conversations = await Conversation.find({
      participants: userId
    });
    
    let totalUnread = 0;
    conversations.forEach(conv => {
      const unread = conv.unreadCount.get(userId.toString()) || 0;
      totalUnread += unread;
    });
    
    return totalUnread;
  }
}

export default new MessageService();