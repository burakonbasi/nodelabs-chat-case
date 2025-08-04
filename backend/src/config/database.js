import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
   // await mongoose.connect(config.mongodb.uri, {
   //   useNewUrlParser: true,
   //   useUnifiedTopology: true
   // });
   await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;