import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

const VENUE_FIELDS = ['name', 'address', 'description', 'image_url', 'opening_hours'] as const;

const optionalTextField = (field: string, maxLength = 255) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(`${field} must be a string`)
    .bail()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must be at most ${maxLength} characters long`);

const enforceKnownVenueFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body || {}).filter((key) => !VENUE_FIELDS.includes(key as (typeof VENUE_FIELDS)[number]));
  if (unknown.length > 0) {
    throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
  }
  return true;
});

const requireAtLeastOneVenueField = body().custom((_, { req }) => {
  const hasKnownField = VENUE_FIELDS.some((field) => req.body[field] !== undefined);
  if (!hasKnownField) {
    throw new Error('At least one updatable field is required');
  }
  return true;
});

export const venueIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

export const createVenueValidation = [
  enforceKnownVenueFields,
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('name is required')
    .bail()
    .isString()
    .withMessage('name must be a string')
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage('name must be at most 255 characters long'),
  optionalTextField('address'),
  optionalTextField('description', 1000),
  optionalTextField('image_url', 2048),
  optionalTextField('opening_hours', 255),
];

export const updateVenueValidation = [
  enforceKnownVenueFields,
  requireAtLeastOneVenueField,
  optionalTextField('name'),
  optionalTextField('address'),
  optionalTextField('description', 1000),
  optionalTextField('image_url', 2048),
  optionalTextField('opening_hours', 255),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Validation failed', { errors: errors.array() });
  }
  return next();
};
