import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { OrderPayload } from '../types/payloads';

export function validateCreateMenuItem(payload: OrderPayload) {
  runValidation([
    () => validateRequired(payload, ['table_id', 'user_id', 'status', 'total_price', 'created_at']),
    () => optionalTextField(payload, ['remarks']),
  ]);
}

export function validateUpdateMenuItem(payload: OrderPayload) {
  runValidation([
    () => optionalTextField(payload, ['table_id', 'user_id', 'status', 'total_price', 'created_at', 'remarks']),
  ]);
}