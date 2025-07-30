import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Sentry, initSentry } from './utils/sentry.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';
import logger from './utils/logger.js';

const app = express();

// Initialize Sentry
initSentry(app);

// Trust proxy
app.set('trust proxy', 1);

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API routes
app.use('/api', routes);

// Swagger documentation
setupSwagger(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Error handling middleware
app.use(errorHandler);

export default app;
