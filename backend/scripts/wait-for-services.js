import mongoose from 'mongoose';
import redis from 'redis';
import amqp from 'amqplib';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/nodelabs-chat?authSource=admin';
const REDIS_URL = `redis://:${process.env.REDIS_PASSWORD || 'redis123'}@${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password123@rabbitmq:5672';

async function waitForMongoDB(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✓ MongoDB is ready');
      await mongoose.disconnect();
      return true;
    } catch (err) {
      console.log(`Waiting for MongoDB... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('MongoDB connection timeout');
}

async function waitForRedis(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = redis.createClient({ url: REDIS_URL });
      await client.connect();
      console.log('✓ Redis is ready');
      await client.quit();
      return true;
    } catch (err) {
      console.log(`Waiting for Redis... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Redis connection timeout');
}

async function waitForRabbitMQ(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      console.log('✓ RabbitMQ is ready');
      await connection.close();
      return true;
    } catch (err) {
      console.log(`Waiting for RabbitMQ... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('RabbitMQ connection timeout');
}

async function waitForAllServices() {
  console.log('Checking service availability...');
  
  try {
    await Promise.all([
      waitForMongoDB(),
      waitForRedis(),
      waitForRabbitMQ()
    ]);
    
    console.log('\n✅ All services are ready!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Service check failed:', error.message);
    process.exit(1);
  }
}

waitForAllServices();