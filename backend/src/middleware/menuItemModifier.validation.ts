import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

const MODIFIER_FIELDS = ['item_id', 'name', 'price_modifier', 'is_available'] as const;

const enforceKnownModifierFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter((k) => !MODIFIER_FIELDS.includes(k as (typeof MODIFIER_FIELDS)[number]));
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
  return true;
});

const requireAtLeastOneModifierField = body().custom((_, { req }) => {
  const hasKnown = MODIFIER_FIELDS.some((f) => req.body[f] !== undefined);
  if (!hasKnown) throw new Error('At least one updatable field is required');
  return true;
});

export const modifierIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const createModifierValidation = [
  enforceKnownModifierFields,
  body('item_id').exists().isInt({ gt: 0 }),
  body('name').exists({ checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  body('price_modifier').optional().isFloat({ min: 0 }),
  body('is_available').optional().isBoolean(),
];

export const updateModifierValidation = [
  enforceKnownModifierFields,
  requireAtLeastOneModifierField,
  body('name').optional().isString(),
  body('price_modifier').optional().isFloat({ min: 0 }),
  body('is_available').optional().isBoolean(),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};