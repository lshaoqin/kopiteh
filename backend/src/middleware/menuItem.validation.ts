import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

const ITEM_FIELDS = ['stall_id', 'item_image', 'name', 'description', 'price', 'prep_time', 'is_available'] as const;

const optionalTextField = (f: string, max = 255) =>
  body(f).optional({ nullable: true }).isString().trim().isLength({ max }).withMessage(`${f} must be at most ${max} chars`);

const optionalBoolean = (f: string) =>
  body(f).optional().isBoolean().withMessage(`${f} must be a boolean`);

const optionalNonNegativeNum = (f: string) =>
  body(f).optional().isFloat({ min: 0 }).withMessage(`${f} must be non-negative`);

const enforceKnownItemFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter((key) => !ITEM_FIELDS.includes(key as (typeof ITEM_FIELDS)[number]));
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
  return true;
});

const requireAtLeastOneItemField = body().custom((_, { req }) => {
  const hasKnown = ITEM_FIELDS.some((f) => req.body[f] !== undefined);
  if (!hasKnown) throw new Error('At least one updatable field is required');
  return true;
});

export const menuItemIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const createMenuItemValidation = [
  enforceKnownItemFields,
  body('stall_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('name').exists({ checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  optionalTextField('item_image', 2048),
  optionalTextField('description', 1000),
  body('price').exists().isFloat({ min: 0 }),
  optionalNonNegativeNum('prep_time'),
  optionalBoolean('is_available'),
];

export const updateMenuItemValidation = [
  enforceKnownItemFields,
  menuItemIdParamValidation,
  requireAtLeastOneItemField,
  optionalTextField('name'),
  optionalTextField('description', 1000),
  optionalTextField('item_image', 2048),
  optionalNonNegativeNum('price'),
  optionalNonNegativeNum('prep_time'),
  optionalBoolean('is_available'),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};
