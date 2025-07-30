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