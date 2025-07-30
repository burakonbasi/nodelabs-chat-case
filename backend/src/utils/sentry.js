import * as Sentry from '@sentry/node';
import config from '../config/index.js';
import logger from './logger.js';

const initSentry = (app) => {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.env,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app })
      ],
      tracesSampleRate: 1.0
    });
    logger.info('Sentry initialized successfully');
  } else {
    logger.warn('Sentry DSN not provided, error tracking disabled');
  }
};

// Create dummy handlers when Sentry is not configured
const dummyMiddleware = (req, res, next) => next();

const SentryHandlers = config.sentry.dsn ? Sentry.Handlers : {
  requestHandler: () => dummyMiddleware,
  errorHandler: () => dummyMiddleware
};

export { Sentry, SentryHandlers, initSentry };