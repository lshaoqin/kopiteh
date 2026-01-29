import { body, param } from 'express-validator';
import { enforceKnownFields, requireAtLeastOneField, optionalNonNegativeNum } from './base.validation';

const ITEM_FIELDS = ['order_id', 'item_id', 'status', 'quantity', 'price'] as const;

export const typeParamValidation = [
  param('type').isIn(['STANDARD', 'CUSTOM']).withMessage('type must be either STANDARD or CUSTOM'),
]

export const orderItemIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const orderIdParamValidation = [
  param('order_id').isInt({ gt: 0 }).withMessage('order_id must be positive integer'),
];

export const stallIdParamValidation = [
  param('stall_id').isInt({ gt: 0 }).withMessage('stall_id must be positive integer'),
];

export const createOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('order_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('item_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('price').exists({ checkFalsy: true }).isFloat({ gt: 0 }),
];

export const updateOrderItemValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  orderItemIdParamValidation,
  requireAtLeastOneField(ITEM_FIELDS as readonly string[]),
  optionalNonNegativeNum('quantity'),
];