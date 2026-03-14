import { Router } from 'express';
import { healthRouter } from './health.js';
import { metricsRouter } from './metrics.js';
import { createFeaturesV1Router } from './v1/features.js';

export const createRootRouter = (): Router => {
  const router = Router();

  router.use(healthRouter);
  router.use(metricsRouter);
  router.use('/v1', createFeaturesV1Router());

  return router;
};
