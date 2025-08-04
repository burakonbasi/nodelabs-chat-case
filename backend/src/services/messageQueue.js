import amqp from 'amqplib';
import logger from '../utils/logger.js';

class MessageQueueService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      MESSAGE_NOTIFICATIONS: 'message_notifications',
      EMAIL_NOTIFICATIONS: 'email_notifications',
      AUTO_MESSAGES: 'auto_messages'
    };
    this.retryCount = 0;
    this.maxRetries = 30;
    this.retryDelay = 2000; // 2 seconds
  }

  async connect() {
    try {
      logger.info('Attempting to connect to RabbitMQ...');
      
      // Connection with retry logic
      while (this.retryCount < this.maxRetries) {
        try {
          const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:password123@rabbitmq:5672';
          
          logger.info(`RabbitMQ connection attempt ${this.retryCount + 1}/${this.maxRetries}`);
          
          this.connection = await amqp.connect(rabbitmqUrl);
          
          // Set up connection event handlers
          this.connection.on('error', (err) => {
            logger.error('RabbitMQ connection error:', err);
            this.handleConnectionError();
          });
          
          this.connection.on('close', () => {
            logger.info('RabbitMQ connection closed');
            this.handleConnectionError();
          });
          
          // Create channel
          this.channel = await this.connection.createChannel();
          
          // Set up queues
          await this.setupQueues();
          
          logger.info('RabbitMQ connected successfully');
          this.retryCount = 0; // Reset retry count
          
          return true;
        } catch (error) {
          this.retryCount++;
          logger.warn(`RabbitMQ connection failed (attempt ${this.retryCount}/${this.maxRetries}): ${error.message}`);
          
          if (this.retryCount >= this.maxRetries) {
            throw new Error(`Failed to connect to RabbitMQ after ${this.maxRetries} attempts`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async setupQueues() {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Assert all queues
    for (const [key, queueName] of Object.entries(this.queues)) {
      await this.channel.assertQueue(queueName, {
        durable: true
      });
      logger.info(`Queue '${queueName}' is ready`);
    }
  }

  handleConnectionError() {
    this.connection = null;
    this.channel = null;
    
    // Try to reconnect after a delay
    setTimeout(() => {
      this.connect().catch(err => {
        logger.error('RabbitMQ reconnection failed:', err);
      });
    }, 5000);
  }

  async publishMessage(queue, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      return this.channel.sendToQueue(queue, messageBuffer, {
        persistent: true
      });
    } catch (error) {
      logger.error('Failed to publish message:', error);
      throw error;
    }
  }

  async consumeMessages(queue, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            await callback(message);
            this.channel.ack(msg);
          } catch (error) {
            logger.error('Error processing message:', error);
            // Requeue the message
            this.channel.nack(msg, false, true);
          }
        }
      });

      logger.info(`Started consuming messages from queue: ${queue}`);
    } catch (error) {
      logger.error('Failed to consume messages:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  // Helper methods for specific queues
  async publishMessageNotification(notification) {
    return this.publishMessage(this.queues.MESSAGE_NOTIFICATIONS, notification);
  }

  async publishEmailNotification(email) {
    return this.publishMessage(this.queues.EMAIL_NOTIFICATIONS, email);
  }

  async publishAutoMessage(message) {
    return this.publishMessage(this.queues.AUTO_MESSAGES, message);
  }
}

export default new MessageQueueService();