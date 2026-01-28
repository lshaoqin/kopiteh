import { body, param, query } from 'express-validator';
import { OrderStatusCodes } from '../types/orderStatus';
import { enforceKnownFields, requireAtLeastOneField, optionalTextField, optionalNonNegativeNum } from './base.validation';

const ITEM_FIELDS = ['table_number', 'items', 'user_id', 'status', 'total_price', 'created_at', 'remarks'] as const;

export const orderIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const userIdParamValidation = [
  param('user_id').isInt({ gt: 0 }).withMessage('user_id must be positive integer'),
];

export const analyticsQueryValidation = [
  query('year')
    .exists({ checkFalsy: true }).withMessage('year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('year must be between 2000 and 2100'),
  query('month')
    .exists({ checkFalsy: true }).withMessage('month is required')
    .isInt({ min: 1, max: 12 }).withMessage('month must be between 1 and 12'),
];

export const createOrderValidation = [
  enforceKnownFields(ITEM_FIELDS as readonly string[]),
  body('table_number').exists().withMessage('Table number is required'),
  optionalNonNegativeNum('user_id'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('total_price').exists().isFloat({ min: 0 }),
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