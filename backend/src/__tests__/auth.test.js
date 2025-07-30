import { jest } from '@jest/globals';
import authService from '../services/authService.js';
import User from '../models/User.js';

// Mock User model
jest.mock('../models/User.js');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '123',
        ...userData,
        toJSON: () => ({ _id: '123', username: userData.username, email: userData.email })
      });

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: '123',
        email: credentials.email,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ _id: '123', email: credentials.email }),
        save: jest.fn()
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await authService.login(credentials.email, credentials.password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(credentials.password);
    });

    it('should throw error for invalid credentials', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});