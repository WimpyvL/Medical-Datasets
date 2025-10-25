import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): Response {
  if (err instanceof HttpError) {
    const { statusCode, message, expose } = err;
    return res.status(statusCode).json({
      status: 'error',
      message: expose ? message : 'Internal server error'
    });
  }

  console.error('Unexpected error', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}
