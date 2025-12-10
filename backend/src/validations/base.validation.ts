import { BadRequestError } from '../controllers/errors';

// Helper to run a list of validation functions
export function runValidation(validators: (() => void)[]) {
  for (const validator of validators) {
    validator();
  }
}

// Helper to check if required fields exist and are not empty
export function validateRequired<T extends Record<string, any>>(payload: T, fields: string[]) {
  const missing = fields.filter(
    (field) =>
      payload[field] === undefined ||
      payload[field] === null ||
      (typeof payload[field] === 'string' && payload[field].trim() === '')
  );

  if (missing.length > 0) {
    throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`, { missing });
  }
}

// Helper to check if optional fields are strings (if provided)
export function optionalTextField<T extends Record<string, any>>(payload: T, fields: string[]) {
  for (const field of fields) {
    const val = payload[field];
    if (val !== undefined && val !== null && typeof val !== 'string') {
      throw new BadRequestError(`Field ${field} must be a string`, { field });
    }
  }
}