import type { Response } from 'express';
import { ErrorCodes, errorTemplates } from './errors';
import { SuccessCodes, successTemplates} from './success';

type SuccessPayload<T> = {
  status: number;
  message: string;
  data: T | null;
};

type SuccessResponse<T> = {
  success: true;
  code: string;
  payload: SuccessPayload<T>;
};

type ErrorPayload = {
  status: number;
  message: string;
  details?: string | undefined;
};

type ErrorResponse = {
  success: false;
  code: string;
  payload: ErrorPayload;
};

export type ServiceResult<T> = SuccessResponse<T> | ErrorResponse;


export function successResponse<T>(code: SuccessCodes, data?: T): SuccessResponse<T> {
  const template = successTemplates[code];
  return { 
    success: true, 
    code: code, 
    payload: { 
      status: template.status, 
      message: template.message,
      data: data || null,
    } 
  };
}

export function errorResponse(code: ErrorCodes, details?: string): ErrorResponse {
  const template = errorTemplates[code];
  return { success: false, 
    code: code,
    payload: {
      status: template.status,
      message: template.message,
      details: details,
    }
  };
}