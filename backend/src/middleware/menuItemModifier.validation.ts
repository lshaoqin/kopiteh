import { validationResult, body, param } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

const MODIFIER_FIELDS_CREATE = ["item_id", "section_id", "name", "price_modifier", "is_available"] as const;
const MODIFIER_FIELDS_UPDATE = ["name", "price_modifier", "is_available"] as const;

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

export const modifierIdParamValidation = [
  param("id").isInt({ gt: 0 }).withMessage("id must be positive integer"),
];

export const itemIdParamValidation = [
  param("item_id").isInt({ gt: 0 }).withMessage("item_id must be positive integer"),
];

export const sectionIdParamValidation = [
  param("section_id").isInt({ gt: 0 }).withMessage("section_id must be positive integer"),
];

export const createModifierValidation = [
  enforceKnownFields(MODIFIER_FIELDS_CREATE),

  body("item_id").exists({ checkFalsy: true }).isInt({ gt: 0 }).withMessage("item_id is required"),
  body("section_id").exists({ checkFalsy: true }).isInt({ gt: 0 }).withMessage("section_id is required"),

  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("name must be at most 255 characters"),

  body("price_modifier").optional().isFloat({ min: 0 }).withMessage("price_modifier must be >= 0"),
  body("is_available").optional().isBoolean().withMessage("is_available must be a boolean"),
];

export const updateModifierValidation = [
  enforceKnownFields(MODIFIER_FIELDS_UPDATE),

  modifierIdParamValidation,
  requireAtLeastOneField(MODIFIER_FIELDS_UPDATE),

  body("name").optional().isString().trim().isLength({ max: 255 }),
  body("price_modifier").optional().isFloat({ min: 0 }).withMessage("price_modifier must be >= 0"),
  body("is_available").optional().isBoolean().withMessage("is_available must be a boolean"),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError("Validation failed", { errors: errors.array() });
  return next();
};