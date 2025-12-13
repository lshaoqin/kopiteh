import { BadRequestError } from '../controllers/errors';

export function validateRequired<T extends Record<string, any>>(payload: T, requiredFields: string[]) {
  const missing: string[] = [];
  for (const f of requiredFields) {
    if (payload[f] === undefined || payload[f] === null || (typeof payload[f] === 'string' && payload[f].trim() === '')) {
      missing.push(f);
    }
  }
  if (missing.length) {
    throw new BadRequestError('Missing required fields', { missing });
  }
}

export function optionalTextField<T extends Record<string, any>>(payload: T, optionalFields: string[]) {
  for (const f of optionalFields) {
    if (payload[f] !== undefined && typeof payload[f] !== 'string') {
      throw new BadRequestError(`Field "${f}" must be a string if provided.`, { f });
    }
  }
}

export function runValidation(validations: (() => void)[]) {
  for (const fn of validations) fn();
}