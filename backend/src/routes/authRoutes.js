import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateRequest } from '../middlewares/validation.js';
import { 
  registerValidator, 
  loginValidator, 
  refreshTokenValidator 
} from '../validators/auth.js';

const router = Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validateRequest,
  authController.login
);

router.post(
  '/refresh',
  refreshTokenValidator,
  validateRequest,
  authController.refreshToken
);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;