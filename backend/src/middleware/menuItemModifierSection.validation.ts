import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

const SECTION_FIELDS_CREATE = ["item_id", "name", "min_selections", "max_selections"] as const;
const SECTION_FIELDS_UPDATE = ["name", "min_selections", "max_selections"] as const;

const enforceKnownFields =
  (allowed: readonly string[]) =>
  body().custom((_, { req }) => {
    const unknown = Object.keys(req.body).filter((k) => !allowed.includes(k));
    if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(", ")}`);
    return true;
  });

const requireAtLeastOneField =
  (allowed: readonly string[]) =>
  body().custom((_, { req }) => {
    const hasKnown = allowed.some((f) => req.body[f] !== undefined);
    if (!hasKnown) throw new Error("At least one updatable field is required");
    return true;
  });

const optionalNonNegativeInt = (f: string) =>
  body(f).optional().isInt({ min: 0 }).withMessage(`${f} must be non-negative integer`);

const enforceMaxGteMin = body().custom((_, { req }) => {
  const min = req.body.min_selections;
  const max = req.body.max_selections;

  // only validate if both are present in this request
  if (min !== undefined && max !== undefined && Number(max) < Number(min)) {
    throw new Error("max_selections must be >= min_selections");
  }
  return true;
});

export const sectionIdParamValidation = [
  param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
];

export const itemIdParamValidation = [
  param("item_id").isInt({ gt: 0 }).withMessage("item_id must be positive integer"),
];

export const createSectionValidation = [
  enforceKnownFields(SECTION_FIELDS_CREATE),

  body("item_id").exists({ checkFalsy: true }).isInt({ gt: 0 }).withMessage("item_id is required"),
  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("name must be at most 255 characters"),

  optionalNonNegativeInt("min_selections"),
  optionalNonNegativeInt("max_selections"),
  enforceMaxGteMin,
];

export const updateSectionValidation = [
  enforceKnownFields(SECTION_FIELDS_UPDATE),

  sectionIdParamValidation,
  requireAtLeastOneField(SECTION_FIELDS_UPDATE),

  body("name").optional().isString().trim().isLength({ max: 255 }),
  optionalNonNegativeInt("min_selections"),
  optionalNonNegativeInt("max_selections"),
  enforceMaxGteMin,
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError("Validation failed", { errors: errors.array() });
  return next();
};
