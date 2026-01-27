import { body, param } from 'express-validator';
import { enforceKnownFields, requireAtLeastOneField, optionalNonNegativeNum, optionalTextField } from './base.validation';

const ITEM_FIELDS = ['stall_id', 'table_id', 'user_id', 'order_item_name', 'status', 'quantity', 'price',  'created_at', 'remarks'] as const;

export const customOrderItemIdParamValidation = [
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

export const createCustomOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('stall_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('table_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  optionalNonNegativeNum('user_id'),
  body('order_item_name').exists({ checkFalsy: true }).isString(),
  body('status').exists({ checkFalsy: true }).isString(),
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('price').exists({ checkFalsy: true }).isFloat({ gt: 0 }),
  body('created_at').exists().isString().isISO8601().trim(),
  optionalTextField('remarks', 1000),
];

export const updateCustomOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  customOrderItemIdParamValidation,
  requireAtLeastOneField(ITEM_FIELDS as readonly string[]),
  optionalNonNegativeNum('quantity'),
  body('created_at').optional().isString().isISO8601().trim(),
  optionalTextField('remarks', 1000),
  
];