
import userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const result = await userService.getUsers(
      parseInt(page),
      parseInt(limit),
      search
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getOnlineUsers = async (req, res, next) => {
  try {
    const onlineUserIds = await userService.getOnlineUsers();
    const count = await userService.getOnlineUserCount();
    
    res.json({
      success: true,
      data: {
        count,
        userIds: onlineUserIds
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkUserOnline = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const isOnline = await userService.isUserOnline(userId);
    
    res.json({
      success: true,
      data: { isOnline }
    });
  } catch (error) {
    next(error);
  }
};