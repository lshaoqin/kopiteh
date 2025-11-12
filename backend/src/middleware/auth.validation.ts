import { validationResult, body } from 'express-validator';
import { BadRequestError } from '../controllers/errors';
import type { Request, Response, NextFunction } from 'express';

export const createAccountValidation = [
  body('name').exists({ checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  body('email').exists({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
  body('password').exists({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('role').exists({ checkFalsy: true }).isString().isIn(['admin', 'user']),
];

export const loginValidation = [
  body('email').exists({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
  body('password').exists({ checkFalsy: true }).isLength({ min: 6 }),
];

export const runValidation = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new BadRequestError('Validation failed', { errors: errors.array() });
  return next();
};
