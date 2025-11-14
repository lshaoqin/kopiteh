import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';
import { OrderItemStatusCodes } from '../types/orderStatus';

const ITEM_FIELDS = ['order_id', 'item_id', 'quantity', 'status', 'unit_price', 'line_subtotal'] as const;

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

export const orderItemIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const createOrderItemValidation = [
  enforceKnownItemFields,
  body('order_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('item_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('status').exists({ checkFalsy: true }).isIn(Object.values(OrderItemStatusCodes)),
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('unit_price').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('line_subtotal').exists({ checkFalsy: true }).isInt({ gt: 0 }),
];

export const updateOrderItemValidation = [
  enforceKnownItemFields,
  orderItemIdParamValidation,
  requireAtLeastOneItemField,
  optionalNonNegativeNum('quantity'),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};