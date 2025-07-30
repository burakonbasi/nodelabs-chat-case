import { createServer } from 'http';
import app from './app.js';
import config from './config/index.js';
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { connectElasticsearch } from './config/elasticsearch.js';
import { initializeSocket } from './sockets/index.js';
import { startMessageConsumer, setSocketIO } from './queues/index.js';
import { initializeCronJobs } from './cron/index.js';
import logger from './utils/logger.js';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Close database connections
  // Add cleanup logic here
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize server
const server = createServer(app);
let cronJobs;

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    
    // Optional: Connect to Elasticsearch
    await connectElasticsearch();
    
    // Initialize Socket.IO
    const io = initializeSocket(server);
    
    // Set Socket.IO instance for message consumer
    setSocketIO(io);
    
    // Start RabbitMQ consumer
    await startMessageConsumer();
    
    // Initialize cron jobs
    cronJobs = initializeCronJobs();
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();