
import messageService from '../services/messageService.js';
import userService from '../services/userService.js';
import logger from '../utils/logger.js';

export const handleConnection = (io) => {
  return async (socket) => {
    const userId = socket.userId;
    
    // Disconnect any existing connections for this user
    const sockets = await io.fetchSockets();
    for (const existingSocket of sockets) {
      if (existingSocket.userId === userId && existingSocket.id !== socket.id) {
        logger.info(`Disconnecting duplicate connection for user ${userId}`);
        existingSocket.disconnect();
      }
    }
    
    // Store user's socket ID to prevent duplicates
    socket.userId = userId;
    
    // Join user's personal room (only once)
    if (!socket.rooms.has(userId)) {
      socket.join(userId);
    }
    
    logger.info(`User ${userId} connected`);
    
    // Set user online
    await userService.setUserOnline(userId);
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId });
    
    // Join user's personal room
    socket.join(userId);
    
    // Handle joining conversation rooms
    socket.on('join_room', async (conversationId) => {
      try {
        socket.join(conversationId);
        logger.info(`User ${userId} joined room ${conversationId}`);
      } catch (error) {
        logger.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;
        
        // Create message
        const result = await messageService.createMessage(
          userId,
          receiverId,
          content
        );
        
        // Emit to sender (confirmation)
        socket.emit('message_sent', {
          message: result.message,
          conversationId: result.conversationId
        });
        
        // Emit to receiver (only if different from sender)
        if (receiverId !== userId) {
          io.to(receiverId).emit('message_received', {
            message: result.message,
            conversationId: result.conversationId
          });
        }
        
        logger.info(`Message sent: ${result.message._id} from ${userId} to ${receiverId}`);
        
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('user_typing', {
        userId,
        conversationId
      });
      io.to(receiverId).emit('user_typing', {
        userId,
        conversationId
      });
    });
    
    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('user_stopped_typing', {
        userId,
        conversationId
      });
      io.to(receiverId).emit('user_stopped_typing', {
        userId,
        conversationId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`User ${userId} disconnected`);
      
      // Set user offline
      await userService.setUserOffline(userId);
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', { userId });
    });
  };
};
