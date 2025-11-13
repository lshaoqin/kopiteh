import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { OrderItemPayload } from '../types/payloads';

export function validateCreateMenuItem(payload: OrderItemPayload) {
  runValidation([
    () => validateRequired(payload, ['order_id', 'item_id', 'stall_id', 'quantity', 'price']),
    () => optionalTextField(payload, []),
  ]);
}

export function validateUpdateMenuItem(payload: OrderItemPayload) {
  runValidation([
    () => optionalTextField(payload, [
      'order_id', 
      'item_id', 
      'stall_id', 
      'quantity', 
      'price',
    ]),
  ]);
}