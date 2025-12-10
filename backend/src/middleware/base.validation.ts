import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';

export const enforceKnownFields = (ITEM_FIELDS: readonly string[]) =>
  body().custom((_, { req }) => {
    const unknown = Object.keys(req.body || {}).filter((key) => !ITEM_FIELDS.includes(key as (typeof ITEM_FIELDS)[number]));
    if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
    return true;
  });

export const requireAtLeastOneField = (ITEM_FIELDS: readonly string[]) =>
  body().custom((_, { req }) => {
    const hasKnownField = ITEM_FIELDS.some((field) => req.body && req.body[field] !== undefined);
    if (!hasKnownField) {
      throw new Error('At least one updatable field is required');
    }
    return true;
  });

export const optionalTextField = (f: string, max = 255) =>
  body(f).optional({ nullable: true }).isString().trim().isLength({ max }).withMessage(`${f} must be at most ${max} chars`);

export const optionalBoolean = (f: string) =>
  body(f).optional().isBoolean().withMessage(`${f} must be a boolean`);

export const optionalNonNegativeNum = (f: string) =>
  body(f).optional().isFloat({ min: 0 }).withMessage(`${f} must be non-negative`);

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Validation failed', { errors: errors.array() });
  }
  return next();
};
