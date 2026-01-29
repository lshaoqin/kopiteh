import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

const MENU_ITEM_FIELDS = [
  "stall_id",
  "item_image",
  "category_id",
  "name",
  "description",
  "price",
  "prep_time",
  "is_available",
  "modifier_sections",
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
  body(field).optional().isBoolean().withMessage(`${field} must be a boolean`);

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

const optionalPositiveIntNullable = (field: string) =>
  body(field)
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage(`${field} must be a positive integer`);
/**
 * Enforce only known fields
 */
const enforceKnownMenuItemFields = body().custom((_, { req }) => {
  const unknown = Object.keys(req.body).filter(
    (key) =>
      !MENU_ITEM_FIELDS.includes(key as (typeof MENU_ITEM_FIELDS)[number]),
  );
  if (unknown.length > 0)
    throw new Error(`Unexpected field(s): ${unknown.join(", ")}`);
  return true;
});

/**
 * Require at least one updatable field for update
 */
const requireAtLeastOneMenuItemField = body().custom((_, { req }) => {
  const hasKnownField = MENU_ITEM_FIELDS.some(
    (field) => req.body[field] !== undefined,
  );
  if (!hasKnownField)
    throw new Error("At least one updatable field is required");
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

  body("stall_id").exists({ checkFalsy: true }).isInt({ gt: 0 }),
  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body("price").exists().isFloat({ min: 0 }),

  body("item_image")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2048 }),
  optionalTextField("item_image", 2048),
  optionalTextField("description", 1000),
  optionalNonNegativeInt("prep_time"),
  optionalBoolean("is_available"),

  optionalPositiveIntNullable("category_id"),
  body("modifier_sections")
    .optional({ nullable: true })
    .isArray()
    .withMessage("modifier_sections must be an array"),

  body("modifier_sections.*.name")
    .optional({ nullable: true })
    .isString()
    .withMessage("modifier section name must be a string")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("modifier section name must be 1-255 characters"),

  body("modifier_sections.*.min_selections")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("min_selections must be a non-negative integer"),

  body("modifier_sections.*.max_selections")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("max_selections must be a non-negative integer"),

  body("modifier_sections.*.options")
    .optional({ nullable: true })
    .isArray()
    .withMessage("options must be an array"),

  body("modifier_sections.*.options.*.name")
    .optional({ nullable: true })
    .isString()
    .withMessage("option name must be a string")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("option name must be 1-255 characters"),

  body("modifier_sections.*.options.*.price_modifier")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("price_modifier must be a non-negative number"),

  body("modifier_sections.*.options.*.is_available")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("option is_available must be a boolean"),

  body("modifier_sections")
    .optional()
    .custom((sections) => {
      if (!Array.isArray(sections)) return true;
      for (const s of sections) {
        const min = Number(s?.min_selections);
        const max = Number(s?.max_selections);
        if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
          throw new Error("max_selections must be >= min_selections");
        }
      }
      return true;
    }),
];

/**
 * Update validation
 */
export const updateMenuItemValidation = [
  enforceKnownMenuItemFields,
  menuItemIdParamValidation,
  requireAtLeastOneMenuItemField,

  body("stall_id")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("stall_id must be a positive integer"),
  body("item_image")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2048 }),

  optionalPositiveIntNullable("category_id"),

  optionalTextField("name"),
  optionalTextField("description", 1000),
  optionalTextField("item_image", 2048),
  optionalNonNegativeFloat("price"),
  optionalNonNegativeInt("prep_time"),
  optionalBoolean("is_available"),

  body("modifier_sections")
    .optional({ nullable: true })
    .isArray()
    .withMessage("modifier_sections must be an array"),

  body("modifier_sections.*.section_id")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("section_id must be a positive integer"),

  body("modifier_sections.*.name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 }),

  body("modifier_sections.*.min_selections")
    .optional({ nullable: true })
    .isInt({ min: 0 }),

  body("modifier_sections.*.max_selections")
    .optional({ nullable: true })
    .isInt({ min: 0 }),

  body("modifier_sections.*.options").optional({ nullable: true }).isArray(),

  body("modifier_sections.*.options.*.option_id")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("option_id must be a positive integer"),

  body("modifier_sections.*.options.*.name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 }),

  body("modifier_sections.*.options.*.price_modifier")
    .optional({ nullable: true })
    .isFloat({ min: 0 }),

  body("modifier_sections.*.options.*.is_available")
    .optional({ nullable: true })
    .isBoolean(),
];

export const runValidation = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed", { errors: errors.array() });
  }
  return next();
};
