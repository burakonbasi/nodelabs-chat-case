import { Server } from 'socket.io';
import { socketAuth } from './socketAuth.js';
import { handleConnection } from './messageHandlers.js';
import logger from '../utils/logger.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true
    }
  });
  
  // Apply authentication middleware
  io.use(socketAuth);
  
  // Handle connections
  io.on('connection', handleConnection(io));
  
  logger.info('Socket.IO initialized');
  
  return io;
};