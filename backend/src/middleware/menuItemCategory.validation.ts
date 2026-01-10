import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

const CATEGORY_FIELDS = ["stall_id", "name", "sort_order"] as const;

const enforceKnownCategoryFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter(
    (k) => !CATEGORY_FIELDS.includes(k as (typeof CATEGORY_FIELDS)[number])
  );
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(", ")}`);
  return true;
});

const requireAtLeastOneCategoryField = body().custom((_, { req }) => {
  const hasKnown = CATEGORY_FIELDS.some((f) => req.body[f] !== undefined);
  if (!hasKnown) throw new Error("At least one updatable field is required");
  return true;
});

const optionalTextField = (field: string, maxLength = 255) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(`${field} must be a string`)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must be at most ${maxLength} characters long`);

const optionalNonNegativeInt = (field: string) =>
  body(field)
    .optional()
    .isInt({ min: 0 })
    .withMessage(`${field} must be a non-negative integer`);

export const categoryIdParamValidation = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
];

export const stallIdParamValidation = [
  param("stall_id").isInt({ gt: 0 }).withMessage("stall_id must be a positive integer"),
];

export const createMenuItemCategoryValidation = [
  enforceKnownCategoryFields,
  body("stall_id")
    .exists({ checkFalsy: true })
    .isInt({ gt: 0 })
    .withMessage("stall_id must be a positive integer"),
  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("name must be at most 255 characters long"),
  optionalNonNegativeInt("sort_order"),
];

export const updateMenuItemCategoryValidation = [
  enforceKnownCategoryFields,
  categoryIdParamValidation,
  requireAtLeastOneCategoryField,
  body("stall_id").optional().isInt({ gt: 0 }).withMessage("stall_id must be a positive integer"),
  optionalTextField("name", 255),
  optionalNonNegativeInt("sort_order"),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed", { errors: errors.array() });
  }
  return next();
};
