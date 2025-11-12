import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { MenuItemPayload, UpdateMenuItemPayload } from '../types/payloads';

export function validateCreateMenuItem(payload: MenuItemPayload) {
  runValidation([
    () => validateRequired(payload, ['stall_id', 'name', 'price']),
    () => optionalTextField(payload, ['item_image', 'description']),
  ]);
}

export function validateUpdateMenuItem(payload: UpdateMenuItemPayload) {
  runValidation([
    () => optionalTextField(payload, [
      'stall_id',
      'item_image',
      'name',
      'description',
    ]),
  ]);
}
