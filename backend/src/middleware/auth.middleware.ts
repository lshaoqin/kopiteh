import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    const result = errorResponse(ErrorCodes.UNAUTHORIZED, 'Missing access token');
    return res.status(result.payload.status).json(result);
  }

  try {
    // verify using your chosen secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded; // attach decoded token data for controllers/services
    return next();
  } catch {
    const result = errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token');
    return res.status(result.payload.status).json(result);
  }
}
