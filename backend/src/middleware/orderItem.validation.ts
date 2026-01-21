import { body, param } from 'express-validator';
import { enforceKnownFields, requireAtLeastOneField, optionalNonNegativeNum } from './base.validation';

const ITEM_FIELDS = ['order_id', 'item_id', 'status', 'quantity', 'unit_price', 'line_subtotal'] as const;

export const orderItemIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
  param('order_id').isInt({ gt: 0 }).withMessage('order_id must be positive integer'),
  param('stall_id').isInt({ gt: 0 }).withMessage('stall_id must be positive integer'),
];

export const createOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('order_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  optionalNonNegativeNum('item_id'),
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('unit_price').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('line_subtotal').exists({ checkFalsy: true }).isInt({ gt: 0 }),
];

export const updateOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  orderItemIdParamValidation,
  requireAtLeastOneField(ITEM_FIELDS as readonly string[]),
  optionalNonNegativeNum('quantity'),
];