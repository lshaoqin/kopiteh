import { body, param } from 'express-validator';
import { OrderStatusCodes } from '../types/orderStatus';
import { enforceKnownFields, requireAtLeastOneField, optionalTextField, optionalNonNegativeNum } from './base.validation';

const ITEM_FIELDS = ['table_id', 'user_id', 'status', 'total_price', 'created_at', 'remarks'] as const;

export const orderIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
  param('user_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('user_id must be positive integer'),
];

export const createOrderValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('table_id').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  optionalNonNegativeNum('user_id'),
  body('status').exists({ checkFalsy: true }).isIn(Object.values(OrderStatusCodes)),
  body('total_price').exists().isFloat({ min: 0 }),
  body('created_at').exists().isString().isISO8601().trim(),
  optionalTextField('remarks', 1000),
];

export const updateOrderValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  orderIdParamValidation,
  requireAtLeastOneField(ITEM_FIELDS as readonly string[]),
  optionalTextField('status'),
  optionalNonNegativeNum('total_price'),
  optionalTextField('created_at'),
  optionalTextField('remarks', 1000),
];