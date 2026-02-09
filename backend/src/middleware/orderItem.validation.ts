import { body, param } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { enforceKnownFields, requireAtLeastOneField, optionalNonNegativeNum } from './base.validation';

const STANDARD_ITEM_FIELDS = ['order_id', 'item_id', 'status', 'quantity', 'price'] as const;
const CUSTOM_ITEM_FIELDS = ['stall_id', 'table_id', 'user_id', 'order_item_name', 'status', 'quantity', 'price',  'created_at', 'remarks'] as const;

const STANDARD_UPDATABLE_FIELDS = ['status', 'quantity', 'price'] as const;
const CUSTOM_UPDATABLE_FIELDS = ['status', 'quantity', 'price', 'remarks'] as const;

const isStandard = (req: any) => req.params.type === 'STANDARD';
const isCustom = (req: any) => req.params.type === 'CUSTOM';

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
  (req: Request, res: Response, next: NextFunction) => {
    const fields =
      req.params.type === 'STANDARD'
        ? STANDARD_ITEM_FIELDS
        : CUSTOM_ITEM_FIELDS;

    return enforceKnownFields(fields as readonly string[])(req, res, next);
  },

  // STANDARD fields
  body('order_id').if(isStandard).exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('item_id').if(isStandard).exists({ checkFalsy: true }).isInt({ gt: 0 }),

  // CUSTOM fields
  body('stall_id').if(isCustom).exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('table_id').if(isCustom).exists({ checkFalsy: true }).isInt({ gt: 0 }),
  optionalNonNegativeNum('user_id'),
  body('order_item_name').if(isCustom).exists({ checkFalsy: true }).isString(),

  // Shared fields
  body('quantity').exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body('price').exists({ checkFalsy: true }).isFloat({ gt: 0 }),
];

export const updateOrderItemValidation = [
  ...orderItemIdParamValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const fields =
      req.params.type === 'STANDARD'
        ? STANDARD_ITEM_FIELDS
        : CUSTOM_ITEM_FIELDS;

    return enforceKnownFields(fields as readonly string[])(req, res, next);
  },

  // Require at least one updatable field
  (req: Request, res: Response, next: NextFunction) => {
    const fields =
      req.params.type === 'STANDARD'
        ? STANDARD_UPDATABLE_FIELDS
        : CUSTOM_UPDATABLE_FIELDS;

    return requireAtLeastOneField(fields as readonly string[])(req, res, next);
  },

  // Optional CUSTOM fields
  body('user_id').if(isCustom).optional().isInt({ gt: 0 }),
  body('remarks').if(isCustom).optional().isString(),

  // Optional shared fields
  body('status').optional().isString(),
  optionalNonNegativeNum('quantity'),
  optionalNonNegativeNum('price'),
];