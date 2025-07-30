

import cron from 'node-cron';
import AutoMessage from '../models/AutoMessage.js';
import { publishToQueue } from '../queues/messageQueue.js';
import logger from '../utils/logger.js';

// Run every minute
export const startMessageQueuer = () => {
  const task = cron.schedule('* * * * *', async () => {
    try {
      logger.debug('Checking for messages to queue...');
      
      const now = new Date();
      
      // Find messages that should be sent
      const messagesToQueue = await AutoMessage.find({
        sendDate: { $lte: now },
        isQueued: false,
        isSent: false
      }).limit(100); // Process max 100 at a time
      
      if (messagesToQueue.length === 0) {
        return;
      }
      
      logger.info(`Found ${messagesToQueue.length} messages to queue`);
      
      // Queue each message
      for (const autoMessage of messagesToQueue) {
        try {
          await publishToQueue({
            autoMessageId: autoMessage._id.toString()
          });
          
          // Mark as queued
          autoMessage.isQueued = true;
          autoMessage.queuedAt = new Date();
          await autoMessage.save();
          
        } catch (error) {
          logger.error(`Failed to queue message ${autoMessage._id}:`, error);
        }
      }
      
    } catch (error) {
      logger.error('Error in message queuer cron job:', error);
    }
  });
  
  logger.info('Message queuer cron job scheduled to run every minute');
  return task;
};