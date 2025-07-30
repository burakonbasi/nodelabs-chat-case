import { getChannel } from '../config/rabbitmq.js';
import AutoMessage from '../models/AutoMessage.js';
import messageService from '../services/messageService.js';
import logger from '../utils/logger.js';

let io; // Socket.IO instance

export const setSocketIO = (socketIO) => {
  io = socketIO;
};

export const startMessageConsumer = async () => {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }
    
    // Set prefetch to process one message at a time
    channel.prefetch(1);
    
    logger.info('Starting message consumer...');
    
    channel.consume('message_sending_queue', async (msg) => {
      if (!msg) return;
      
      try {
        const data = JSON.parse(msg.content.toString());
        logger.info(`Processing message: ${data.autoMessageId}`);
        
        // Get auto message details
        const autoMessage = await AutoMessage.findById(data.autoMessageId)
          .populate('senderId', '_id username')
          .populate('receiverId', '_id username');
        
        if (!autoMessage) {
          logger.error(`AutoMessage not found: ${data.autoMessageId}`);
          channel.ack(msg);
          return;
        }
        
        // Create actual message
        const result = await messageService.createMessage(
          autoMessage.senderId._id,
          autoMessage.receiverId._id,
          autoMessage.content
        );
        
        // Mark auto message as sent
        autoMessage.isSent = true;
        autoMessage.sentAt = new Date();
        await autoMessage.save();
        
        // Send via Socket.IO if available
        if (io) {
          // Emit to receiver
          io.to(autoMessage.receiverId._id.toString()).emit('message_received', {
            message: result.message,
            conversationId: result.conversationId
          });
          
          logger.info(`Message sent via Socket.IO to ${autoMessage.receiverId.username}`);
        }
        
        // Acknowledge message
        channel.ack(msg);
        logger.info(`Message processed successfully: ${data.autoMessageId}`);
        
      } catch (error) {
        logger.error('Error processing message:', error);
        
        // Reject and requeue the message
        channel.nack(msg, false, true);
      }
    });
    
  } catch (error) {
    logger.error('Error starting message consumer:', error);
    throw error;
  }
};