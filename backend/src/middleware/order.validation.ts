import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';
import { OrderStatusCodes } from '../types/orderStatus';

const ITEM_FIELDS = ['table_id', 'user_id', 'status', 'total_price', 'created_at', 'remarks'] as const;

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

export const orderIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const createOrderValidation = [
  enforceKnownItemFields,
  body('table_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('user_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('status').exists({ checkFalsy: true }).isIn(Object.values(OrderStatusCodes)),
  body('total_price').exists().isFloat({ min: 0 }),
  body('created_at').exists().isString().isISO8601().trim(),
  optionalTextField('remarks', 1000),
];

export const updateOrderValidation = [
  enforceKnownItemFields,
  orderIdParamValidation,
  requireAtLeastOneItemField,
  optionalTextField('status'),
  optionalNonNegativeNum('total_price'),
  optionalTextField('created_at'),
  optionalTextField('remarks', 1000),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};