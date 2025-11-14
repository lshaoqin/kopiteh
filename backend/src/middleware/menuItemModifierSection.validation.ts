import { validationResult, body, param } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

const SECTION_FIELDS = ['item_id', 'name', 'min_selections', 'max_selections'] as const;

const enforceKnownSectionFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter((k) => !SECTION_FIELDS.includes(k as (typeof SECTION_FIELDS)[number]));
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(', ')}`);
  return true;
});

const requireAtLeastOneSectionField = body().custom((_, { req }) => {
  const hasKnown = SECTION_FIELDS.some((f) => req.body[f] !== undefined);
  if (!hasKnown) throw new Error('At least one updatable field is required');
  return true;
});

const optionalNonNegativeInt = (f: string) =>
  body(f).optional().isInt({ min: 0 }).withMessage(`${f} must be non-negative integer`);

export const sectionIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be positive integer'),
];

export const createSectionValidation = [
  enforceKnownSectionFields,
  body('item_id').exists().isInt({ gt: 0 }),
  body('name').exists({ checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  optionalNonNegativeInt('min_selections'),
  optionalNonNegativeInt('max_selections'),
  body().custom((val) => {
    if (val.min_selections !== undefined && val.max_selections !== undefined && val.max_selections < val.min_selections)
      throw new Error('max_selections must be >= min_selections');
    return true;
  }),
];

export const updateSectionValidation = [
  enforceKnownSectionFields,
  requireAtLeastOneSectionField,
  body('name').optional().isString(),
  optionalNonNegativeInt('min_selections'),
  optionalNonNegativeInt('max_selections'),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};