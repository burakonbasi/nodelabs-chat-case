import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

class AuthService {
  generateAccessToken(userId) {
    return jwt.sign(
      { id: userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );
  }
  
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpire }
    );
  }
  
  async register(userData) {
    const { username, email, password } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      throw new Error(
        existingUser.email === email ? 'Email already exists' : 'Username already exists'
      );
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    logger.info(`New user registered: ${user.email}`);
    
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }
  
  async login(email, password) {
    logger.info(`Login attempt for email: ${email}`);
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password +refreshToken');
    
    if (!user) {
      logger.warn(`Login failed: User not found for email: ${email}`);
      throw new Error('Invalid credentials');
    }
    
    logger.info(`User found: ${user.username}`);
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user: ${user.username}`);
      throw new Error('Invalid credentials');
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Update refresh token
    user.refreshToken = refreshToken;
    user.lastSeen = new Date();
    await user.save();
    
    logger.info(`User logged in: ${user.email}`);
    
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }
  
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      // Find user
      const user = await User.findById(decoded.id).select('+refreshToken');
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
      
      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);
      
      // Update refresh token
      user.refreshToken = newRefreshToken;
      await user.save();
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null
    });
    
    logger.info(`User logged out: ${userId}`);
  }
  
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default new AuthService();