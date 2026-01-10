import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

const MENU_ITEM_FIELDS = [
  "stall_id",
  "item_image",
  "name",
  "description",
  "price",
  "prep_time",
  "is_available",
] as const;

const optionalTextField = (field: string, maxLength = 255) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(`${field} must be a string`)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must be at most ${maxLength} characters long`);

const optionalBoolean = (field: string) =>
  body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean`);

const optionalNonNegativeInt = (field: string) =>
  body(field)
    .optional()
    .isInt({ min: 0 })
    .withMessage(`${field} must be a non-negative integer`);

const optionalNonNegativeFloat = (field: string) =>
  body(field)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a non-negative number`);

/**
 * Enforce only known fields
 */
const enforceKnownMenuItemFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter(
    (key) => !MENU_ITEM_FIELDS.includes(key as (typeof MENU_ITEM_FIELDS)[number])
  );
  if (unknown.length > 0) throw new Error(`Unexpected field(s): ${unknown.join(", ")}`);
  return true;
});

/**
 * Require at least one updatable field for update
 */
const requireAtLeastOneMenuItemField = body().custom((_, { req }) => {
  const hasKnownField = MENU_ITEM_FIELDS.some((field) => req.body[field] !== undefined);
  if (!hasKnownField) throw new Error("At least one updatable field is required");
  return true;
});

/**
 * Param validations
 */
export const stallIdParamValidation = [
  param("stall_id")
    .exists()
    .withMessage("stall_id is required")
    .isInt({ min: 1 })
    .withMessage("stall_id must be a positive integer"),
];

export const menuItemIdParamValidation = [
  param("id")
    .exists()
    .withMessage("id is required")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer"),
];

/**
 * Create validation
 */
export const createMenuItemValidation = [
  enforceKnownMenuItemFields,

  body("stall_id")
    .exists({ checkFalsy: true })
    .withMessage("stall_id is required")
    .isInt({ gt: 0 })
    .withMessage("stall_id must be a positive integer"),

  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("name must be at most 255 characters"),

  body("price")
    .exists()
    .withMessage("price is required")
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number"),

  optionalTextField("item_image", 2048),
  optionalTextField("description", 1000),
  optionalNonNegativeInt("prep_time"),
  optionalBoolean("is_available"),
];

/**
 * Update validation
 */
export const updateMenuItemValidation = [
  enforceKnownMenuItemFields,
  menuItemIdParamValidation,
  requireAtLeastOneMenuItemField,

  body("stall_id").optional().isInt({ gt: 0 }).withMessage("stall_id must be a positive integer"),
  optionalTextField("name"),
  optionalTextField("description", 1000),
  optionalTextField("item_image", 2048),
  optionalNonNegativeFloat("price"),
  optionalNonNegativeInt("prep_time"),
  optionalBoolean("is_available"),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed", { errors: errors.array() });
  }
  return next();
};
