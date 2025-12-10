import { validationResult, body } from "express-validator";
import { BadRequestError } from "../controllers/errors";
import type { Request, Response, NextFunction } from "express";

/* Helper validation functions */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertPasswordStrength(pass: string) {
  if (pass.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters.", { field: "password" });
  }
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) {
    throw new BadRequestError("Password must contain at least one letter and one digit.", {
      field: "password",
    });
  }
}

export function assertEmail(email: string) {
  if (!EMAIL_RE.test(email)) {
    throw new BadRequestError("Invalid email format.", { field: "email" });
  }
}

export function assertRole(role: string, allowed = ["admin", "user"]) {
  if (!allowed.includes(role)) {
    throw new BadRequestError(`role must be one of: ${allowed.join(", ")}`, {
      field: "role",
      value: role,
    });
  }
}

export const createAccountValidation = [
  body("name")
    .exists({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email required")
    .custom((email) => {
      assertEmail(email);
      return true;
    }),
  body("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars")
    .custom((password) => {
      assertPasswordStrength(password);
      return true;
    }),
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
    .withMessage("Valid email required")
    .custom((email) => {
      assertEmail(email);
      return true;
    }),
  body("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .custom((password) => {
      assertPasswordStrength(password);
      return true;
    }),
];

export const forgotPasswordValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email required")
    .custom((email) => {
      assertEmail(email);
      return true;
    }),

  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters"),

  body("newPassword")
    .exists({ checkFalsy: true })
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password) => {
      assertPasswordStrength(password);
      return true;
    }),
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
