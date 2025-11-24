import { validationResult, body } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

export const createAccountValidation = [
  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email required"),
  body("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
  body("secretCode")
    .exists({ checkFalsy: true })
    .withMessage("Secret code is required")
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Secret code must be between 3 and 255 characters"),
];

export const loginValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email required"),
  body("password").exists({ checkFalsy: true }).isLength({ min: 6 }),
];

export const runValidation = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw new BadRequestError("Validation failed", { errors: errors.array() });
  return next();
};
