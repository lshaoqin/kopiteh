import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../controllers/errors';

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof BadRequestError) {
    return res.status(err.status).json({ success: false, error: { message: err.message, details: err.details || null } });
  }

  // If a service returned an error object
  if (err && err.success === false && err.error) {
    const status = (err.error as any).status || 500;
    return res.status(status).json(err);
  }

  console.error(err);
  return res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
}
