import User from '../models/User.js';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

class UserService {
  async getUsers(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  async getActiveUsers() {
    // Get users who have been active in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await User.find({
      isActive: true,
      lastSeen: { $gte: thirtyDaysAgo }
    }).select('_id username email');
  }
  
  async setUserOnline(userId) {
    if (!redisClient) return;
    
    try {
      await redisClient.sAdd('online_users', userId.toString());
      logger.info(`User ${userId} is now online`);
    } catch (error) {
      logger.error('Error setting user online:', error);
    }
  }
  
  async setUserOffline(userId) {
    if (!redisClient) return;
    
    try {
      await redisClient.sRem('online_users', userId.toString());
      logger.info(`User ${userId} is now offline`);
    } catch (error) {
      logger.error('Error setting user offline:', error);
    }
  }
  
  async getOnlineUsers() {
    if (!redisClient) return [];
    
    try {
      const userIds = await redisClient.sMembers('online_users');
      return userIds;
    } catch (error) {
      logger.error('Error getting online users:', error);
      return [];
    }
  }
  
  async isUserOnline(userId) {
    if (!redisClient) return false;
    
    try {
      return await redisClient.sIsMember('online_users', userId.toString());
    } catch (error) {
      logger.error('Error checking user online status:', error);
      return false;
    }
  }
  
  async getOnlineUserCount() {
    if (!redisClient) return 0;
    
    try {
      return await redisClient.sCard('online_users');
    } catch (error) {
      logger.error('Error getting online user count:', error);
      return 0;
    }
  }
}

export default new UserService();
