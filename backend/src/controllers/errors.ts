export class BadRequestError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401; 
    this.details = details;
  }
}

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
