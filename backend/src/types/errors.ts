export enum ErrorCodes {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export const errorTemplates: Record<ErrorCodes, { message: string; status: number }> = {
  [ErrorCodes.NOT_FOUND]: {
    message: 'The requested resource was not found.',
    status: 404,
  },
  [ErrorCodes.VALIDATION_ERROR]: {
    message: 'Input validation failed.',
    status: 400,
  },
  [ErrorCodes.DATABASE_ERROR]: {
    message: 'A database error occurred.',
    status: 500,
  },
  [ErrorCodes.UNAUTHORIZED]: {
    message: 'You must be logged in to access this resource.',
    status: 401,
  },
  [ErrorCodes.INTERNAL_ERROR]: {
    message: 'An internal server error occurred.',
    status: 500,
  },
};