import { Client } from '@elastic/elasticsearch';
import config from './index.js';
import logger from '../utils/logger.js';

let elasticClient = null;

const connectElasticsearch = async () => {
  try {
    // Elasticsearch opsiyonel - yoksa devam et
    if (!config.elasticsearch.node) {
      logger.info('Elasticsearch URL not provided, search will use MongoDB');
      return null;
    }

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
    logger.info('Search functionality will use MongoDB instead');
    return null;
  }
};

export { connectElasticsearch, elasticClient };