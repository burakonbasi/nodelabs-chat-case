import { startMessagePlanner } from './messagePlanner.js';
import { startMessageQueuer } from './messageQueuer.js';
import { startCleanupJob } from './cleanup.js';
import logger from '../utils/logger.js';

export const initializeCronJobs = () => {
  logger.info('Initializing cron jobs...');
  
  const jobs = {
    messagePlanner: startMessagePlanner(),
    messageQueuer: startMessageQueuer(),
    cleanup: startCleanupJob()
  };
  
  logger.info('All cron jobs initialized');
  
  return jobs;
};