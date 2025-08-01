import cron from 'node-cron';
import AutoMessage from '../models/AutoMessage.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Run daily at 03:00
export const startCleanupJob = () => {
  const task = cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Starting cleanup cron job...');
      
      // Eski gönderilen otomatik mesajları sil (7 günden eski)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await AutoMessage.deleteMany({
        isSent: true,
        sentAt: { $lt: sevenDaysAgo }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} old auto messages`);
      
    } catch (error) {
      logger.error('Error in cleanup cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: config.cron.timezone
  });
  
  logger.info('Cleanup cron job scheduled for 03:00 daily');
  return task;
};
