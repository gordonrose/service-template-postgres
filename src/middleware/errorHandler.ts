import type { ErrorRequestHandler } from 'express';
import { isHttpError } from '../lib/httpErrors.js';

interface ErrorBody {
  error: {
    message: string;
    statusCode: number;
  };
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (isHttpError(error)) {
    const body: ErrorBody = {
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    };

    response.status(error.statusCode).json(body);
    return;
  }

  const body: ErrorBody = {
    error: {
      message: 'Internal server error.',
      statusCode: 500,
    },
  };

  response.status(500).json(body);
};
