import { getChannel } from '../config/rabbitmq.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'message_sending_queue';

export const publishToQueue = async (data) => {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }
    
    const message = Buffer.from(JSON.stringify(data));
    
    const sent = channel.sendToQueue(QUEUE_NAME, message, {
      persistent: true
    });
    
    if (sent) {
      logger.info(`Message queued: ${data.autoMessageId}`);
    } else {
      logger.error('Failed to queue message');
    }
    
    return sent;
  } catch (error) {
    logger.error('Error publishing to queue:', error);
    throw error;
  }
};