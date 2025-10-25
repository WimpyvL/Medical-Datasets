import type { Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response): Response {
  return res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
}
