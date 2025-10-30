import pino from 'pino';

export const makeLogger = (name?: string) =>
  pino({
    name: name || 'app',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'production' ? undefined : {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' }
    }
  });
