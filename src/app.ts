import express, { type Express } from 'express';

import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestContextMiddleware } from './middleware/requestContext.js';
import { createRootRouter } from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('env', config.nodeEnv);

  app.use(requestContextMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use(createRootRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
