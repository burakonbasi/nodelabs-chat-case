import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/list', userController.getUsers);
router.get('/online', userController.getOnlineUsers);
router.get('/online/:userId', userController.checkUserOnline);

export default router;