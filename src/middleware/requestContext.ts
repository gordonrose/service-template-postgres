import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

import {
  runWithRequestContext,
  type RequestContext,
} from '../lib/requestContext.js';

export const requestContextMiddleware: RequestHandler = (
  _request,
  _response,
  next,
) => {
  const context: RequestContext = Object.freeze({
    requestId: randomUUID(),
  });

  runWithRequestContext(context, () => {
    next();
  });
};
