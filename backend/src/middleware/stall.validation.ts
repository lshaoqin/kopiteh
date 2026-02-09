import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

const STALL_FIELDS = ['venue_id', 'name', 'description', 'stall_image', 'is_open'] as const;

const optionalTextField = (field: string, maxLength = 255) =>
  body(field)
    .optional({ nullable: true })
    .isString().withMessage(`${field} must be a string`)
    .trim().isLength({ max: maxLength })
    .withMessage(`${field} must be at most ${maxLength} characters long`);

const optionalBoolean = (field: string) =>
  body(field).optional().isBoolean().withMessage(`${field} must be a boolean`);

const optionalNonNegativeInt = (field: string) =>
  body(field).optional().isInt({ min: 0 }).withMessage(`${field} must be a non-negative integer`);

const enforceKnownStallFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter((key) => !STALL_FIELDS.includes(key as (typeof STALL_FIELDS)[number]));
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
  return true;
});

const requireAtLeastOneStallField = body().custom((_, { req }) => {
  const hasKnownField = STALL_FIELDS.some((field) => req.body[field] !== undefined);
  if (!hasKnownField) throw new Error('At least one updatable field is required');
  return true;
});

export const venueIdParamValidation = [
  param("venue_id")
    .exists().withMessage("venue_id is required")
    .isInt({ min: 1 }).withMessage("venue_id must be a positive integer"),
];

export const stallIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

export const createStallValidation = [
  enforceKnownStallFields,
  body('venue_id')
    .exists({ checkFalsy: true })
    .isInt({ gt: 0 })
    .withMessage('venue_id must be a positive integer'),

  body('name')
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),

  optionalTextField('description', 1000),
  optionalTextField('stall_image', 2048),
];

export const updateStallValidation = [
  enforceKnownStallFields,
  stallIdParamValidation,
  requireAtLeastOneStallField,
  optionalTextField('name'),
  optionalTextField('description', 1000),
  optionalTextField('stall_image', 2048),
  optionalBoolean('is_open'),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};