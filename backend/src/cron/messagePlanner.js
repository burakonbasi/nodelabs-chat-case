import cron from 'node-cron';
import AutoMessage from '../models/AutoMessage.js';
import userService from '../services/userService.js';
import { generateRandomMessage } from '../utils/messageGenerator.js';
import { createUserPairs } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Run every night at 02:00
export const startMessagePlanner = () => {
  const task = cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting message planning cron job...');
      
      // Get active users
      const activeUsers = await userService.getActiveUsers();
      
      if (activeUsers.length < 2) {
        logger.info('Not enough active users for message planning');
        return;
      }
      
      // Create user pairs
      const pairs = createUserPairs(activeUsers);
      logger.info(`Created ${pairs.length} user pairs`);
      
      // Create auto messages for each pair
      const autoMessages = [];
      
      for (const pair of pairs) {
        // Generate random send time within next 24 hours
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const randomTime = new Date(
          now.getTime() + Math.random() * (tomorrow.getTime() - now.getTime())
        );
        
        const autoMessage = {
          senderId: pair.sender._id,
          receiverId: pair.receiver._id,
          content: generateRandomMessage(),
          sendDate: randomTime,
          isQueued: false,
          isSent: false
        };
        
        autoMessages.push(autoMessage);
      }
      
      // Bulk insert auto messages
      if (autoMessages.length > 0) {
        await AutoMessage.insertMany(autoMessages);
        logger.info(`Created ${autoMessages.length} auto messages`);
      }
      
    } catch (error) {
      logger.error('Error in message planner cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: config.cron.timezone
  });
  
  logger.info('Message planner cron job scheduled for 02:00 daily');
  return task;
};