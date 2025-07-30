
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

// src/utils/messageGenerator.js
const messages = [
  "Merhaba, nasılsın?",
  "Bugün hava çok güzel!",
  "Ne yapıyorsun?",
  "Uzun zamandır görüşemiyoruz.",
  "Kahve içmeye ne dersin?",
  "Yeni projende başarılar!",
  "Film önerebilir misin?",
  "Hafta sonu planların var mı?",
  "Kitap okuyor musun bu aralar?",
  "Spor yapıyor musun?",
  "Yemek yemeye çıkalım mı?",
  "Haberler çok kötü değil mi?",
  "Tatil planların var mı?",
  "İş nasıl gidiyor?",
  "Ailen nasıl?"
];

export const generateRandomMessage = () => {
  return messages[Math.floor(Math.random() * messages.length)];
};
