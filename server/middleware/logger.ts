import { defineEventHandler } from 'h3';
import { useRuntimeConfig } from '#imports';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const startTime = Date.now();
  
  // لاگ کردن درخواست
  logger.info('Incoming request', {
    method: event.method,
    path: event.path,
    query: getQuery(event),
    user: event.context.user?.id,
    ip: event.node.req.socket.remoteAddress
  });

  // ذخیره زمان شروع
  event.context.startTime = startTime;

  // اضافه کردن event handler برای لاگ کردن پاسخ
  event.node.res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = event.node.res.statusCode;

    logger.info('Request completed', {
      method: event.method,
      path: event.path,
      status,
      duration,
      user: event.context.user?.id,
      ip: event.node.req.socket.remoteAddress
    });

    // لاگ کردن خطاها
    if (status >= 400) {
      logger.error('Request failed', {
        method: event.method,
        path: event.path,
        status,
        duration,
        user: event.context.user?.id,
        ip: event.node.req.socket.remoteAddress,
        error: event.context.error
      });
    }
  });
}); 