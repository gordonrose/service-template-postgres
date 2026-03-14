import { Router } from 'express';
import { renderMetrics } from '../metrics/registry.js';

export const metricsRouter = Router();

metricsRouter.get('/metrics', (_request, response) => {
  response
    .status(200)
    .type('text/plain; version=0.0.4; charset=utf-8')
    .send(renderMetrics());
});
