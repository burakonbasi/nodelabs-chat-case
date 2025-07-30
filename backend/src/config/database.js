import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;

// src/config/redis.js
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

// src/config/rabbitmq.js
import amqp from 'amqplib';
import config from './index.js';
import logger from '../utils/logger.js';

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    
    // Create the message sending queue
    await channel.assertQueue('message_sending_queue', {
      durable: true
    });
    
    logger.info('RabbitMQ connected successfully');
    
    // Handle connection close
    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
    });
    
    return { connection, channel };
  } catch (error) {
    logger.error('RabbitMQ connection error:', error);
    throw error;
  }
};

const getChannel = () => channel;

export { connectRabbitMQ, getChannel };

// src/config/elasticsearch.js
import { Client } from '@elastic/elasticsearch';
import config from './index.js';
import logger from '../utils/logger.js';

let elasticClient;

const connectElasticsearch = async () => {
  try {
    elasticClient = new Client({
      node: config.elasticsearch.node,
      auth: config.elasticsearch.auth.username ? {
        username: config.elasticsearch.auth.username,
        password: config.elasticsearch.auth.password
      } : undefined
    });
    
    // Test connection
    await elasticClient.ping();
    logger.info('Elasticsearch connected successfully');
    
    // Create messages index if it doesn't exist
    const indexExists = await elasticClient.indices.exists({ index: 'messages' });
    if (!indexExists) {
      await elasticClient.indices.create({
        index: 'messages',
        body: {
          mappings: {
            properties: {
              content: { type: 'text' },
              senderId: { type: 'keyword' },
              receiverId: { type: 'keyword' },
              conversationId: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
      logger.info('Messages index created in Elasticsearch');
    }
    
    return elasticClient;
  } catch (error) {
    logger.warn('Elasticsearch connection failed (non-critical):', error.message);
    return null;
  }
};

export { connectElasticsearch, elasticClient };