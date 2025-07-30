import { jest } from '@jest/globals';
import messageService from '../services/messageService.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

jest.mock('../models/Message.js');
jest.mock('../models/Conversation.js');

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a new message and conversation', async () => {
      const senderId = '123';
      const receiverId = '456';
      const content = 'Hello!';

      Conversation.findOne.mockResolvedValue(null);
      Conversation.create.mockResolvedValue({
        _id: 'conv123',
        participants: [senderId, receiverId],
        unreadCount: new Map(),
        save: jest.fn()
      });

      const mockMessage = {
        _id: 'msg123',
        conversationId: 'conv123',
        senderId,
        receiverId,
        content,
        populate: jest.fn().mockResolvedValue({
          _id: 'msg123',
          senderId: { _id: senderId, username: 'sender' },
          receiverId,
          content
        })
      };

      Message.create.mockResolvedValue(mockMessage);

      const result = await messageService.createMessage(senderId, receiverId, content);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('conversationId');
      expect(Message.create).toHaveBeenCalledWith({
        conversationId: 'conv123',
        senderId,
        receiverId,
        content
      });
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages from a conversation', async () => {
      const conversationId = 'conv123';
      const userId = '123';

      Conversation.findOne.mockResolvedValue({
        _id: conversationId,
        participants: [userId, '456'],
        unreadCount: new Map(),
        save: jest.fn()
      });

      const mockMessages = [
        { _id: 'msg1', content: 'Hello', receiverId: { _id: '456' } },
        { _id: 'msg2', content: 'Hi there', receiverId: { _id: userId } }
      ];

      Message.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockMessages)
              })
            })
          })
        })
      });

      Message.countDocuments.mockResolvedValue(2);
      Message.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await messageService.getMessages(conversationId, userId);

      expect(result.messages).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(Message.updateMany).toHaveBeenCalled();
    });
  });
});