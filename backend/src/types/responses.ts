export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorPayload = {
  code?: string;
  message: string;
  details?: unknown;
};

export type ErrorResponse = {
  success: false;
  error: ErrorPayload;
};

export type ServiceResult<T> = SuccessResponse<T> | ErrorResponse;
