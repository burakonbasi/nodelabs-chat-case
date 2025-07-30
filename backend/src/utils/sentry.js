
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

export { Sentry, initSentry };

