import { body, param } from 'express-validator';
import { enforceKnownFields, requireAtLeastOneField, optionalTextField } from './base.validation';

const VENUE_FIELDS = ['name', 'address', 'description', 'image_url', 'opening_hours'] as const;



export const venueIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

export const createVenueValidation = [
  enforceKnownFields(VENUE_FIELDS as readonly string[]),
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
  enforceKnownFields(VENUE_FIELDS as readonly string[]),
  requireAtLeastOneField(VENUE_FIELDS as readonly string[]),
  venueIdParamValidation,
  optionalTextField('name'),
  optionalTextField('address'),
  optionalTextField('description', 1000),
  optionalTextField('image_url', 2048),
  optionalTextField('opening_hours', 255),
];
