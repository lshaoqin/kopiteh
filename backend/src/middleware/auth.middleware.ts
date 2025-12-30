import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

  if (!token) {
    const result = errorResponse(
      ErrorCodes.UNAUTHORIZED,
      "Missing or malformed Authorization header"
    );
    return res.status(result.payload.status).json(result);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const result = errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "JWT secret is not configured"
    );
    return res.status(result.payload.status).json(result);
  }

  try {
    const decoded = jwt.verify(token, secret);

    (req as any).user = decoded;

    return next();
  } catch (err) {
    const result = errorResponse(
      ErrorCodes.UNAUTHORIZED,
      "Invalid or expired token"
    );
    return res.status(result.payload.status).json(result);
  }
}
