import { createClient } from 'redis';
import config from './index.js';
import logger from '../utils/logger.js';

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      },
      password: config.redis.password || undefined
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

export { connectRedis, redisClient };