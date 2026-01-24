import { body, param } from 'express-validator';
import { enforceKnownFields, requireAtLeastOneField, optionalNonNegativeNum } from './base.validation';

const ITEM_FIELDS = ['stall_id', 'table_id', 'user_id', 'order_item_name', 'status', 'quantity', 'price', 'remarks'] as const;

export const orderItemIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const stallIdParamValidation = [
  param('stall_id').isInt({ gt: 0 }).withMessage('stall_id must be positive integer'),
];

export const tableIdParamValidation = [
  param('table_id').isInt({ gt: 0 }).withMessage('table_id must be positive integer'),
];

export const userIdParamValidation = [
  param('user_id').isInt({ gt: 0 }).withMessage('user_id must be positive integer'),
];

export const createOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('stall_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('table_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  optionalNonNegativeNum('user_id'),
  body('order_item_name').exists({ checkFalsy: true }).isString(),
  body('status').exists({ checkFalsy: true }).isString(),
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('price').exists({ checkFalsy: true }).isFloat({ gt: 0 }),
];

export const updateOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  orderItemIdParamValidation,
  requireAtLeastOneField(ITEM_FIELDS as readonly string[]),
  optionalNonNegativeNum('quantity'),
];