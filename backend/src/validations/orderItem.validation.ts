import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { OrderItemPayload, UpdateOrderItemPayload } from '../types/payloads';

export function validateCreateOrderItem(payload: OrderItemPayload) {
  runValidation([
    () => validateRequired(payload, ['order_id', 'item_id', 'quantity', 'status', 'unit_price', 'line_subtotal']),
    () => optionalTextField(payload, []),
  ]);
}

export function validateUpdateOrderItem(payload: UpdateOrderItemPayload) {
  runValidation([
    () => optionalTextField(payload, ['order_id', 'item_id', 'quantity', 'status', 'unit_price', 'line_subtotal']),
  ]);
}