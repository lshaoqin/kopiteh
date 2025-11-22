import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';

export function validateCreateOrder(payload: OrderPayload) {
  runValidation([
    () => validateRequired(payload, ['table_id', 'user_id', 'status', 'total_price', 'created_at']),
    () => optionalTextField(payload, ['remarks']),
  ]);
}

export function validateUpdateOrder(payload: UpdateOrderPayload) {
  runValidation([
    () => optionalTextField(payload, ['table_id', 'user_id', 'status', 'total_price', 'created_at', 'remarks']),
  ]);
}