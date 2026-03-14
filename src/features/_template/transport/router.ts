import { randomUUID } from 'node:crypto';

import {
  Router,
  type RequestHandler,
} from 'express';

import { getOptionalRequestContext } from '../../../lib/requestContext.js';
import type { TemplateCreateResponse } from '../contract/types.js';
import { validateTemplateCreateRequest } from '../contract/validate.js';
import { executeTemplateCommand } from '../domain/service.js';
import { createTemplatePostgresEntityRepository } from '../persistence/postgresTemplateEntityRepository.js';

const templateEntityRepository = createTemplatePostgresEntityRepository();

const createTemplateHandler: RequestHandler = (
  request,
  response,
  next,
) => {
  const validation = validateTemplateCreateRequest(request.body);

  if (!validation.ok) {
    return response.status(400).json({
      errors: validation.issues,
    });
  }

  const requestContext = getOptionalRequestContext();

  if (requestContext === null) {
    const result = executeTemplateCommand({
      name: validation.value.name,
    });

    const payload: TemplateCreateResponse = {
      message: result.message,
    };

    return response.status(200).json(payload);
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  void executeTemplateCommand(
    {
      id,
      createdAt,
      name: validation.value.name,
    },
    {
      requestContext,
      templateEntityRepository,
    },
  )
    .then((result) => {
      const payload: TemplateCreateResponse = {
        message: result.message,
        ...(result.id === undefined ? {} : { id: result.id }),
        ...(result.createdAt === undefined ? {} : { createdAt: result.createdAt }),
      };

      response.status(200).json(payload);
    })
    .catch(next);
};

export function createTemplateRouter(): Router {
  const router = Router();

  router.post('/', createTemplateHandler);

  return router;
}
