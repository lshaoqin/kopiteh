import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { MenuItemModifierPayload } from '../types/payloads';
import { BadRequestError } from '../controllers/errors';

function optionalNonNegativeDecimal(obj: any, fields: string[]) {
  for (const f of fields) {
    if (obj[f] !== undefined && typeof obj[f] !== 'number')
      throw new BadRequestError(`${f} must be a number`, { field: f });
    if (obj[f] !== undefined && obj[f] < 0)
      throw new BadRequestError(`${f} cannot be negative`, { field: f });
  }
}

export function validateCreateMenuItemModifier(payload: MenuItemModifierPayload) {
  runValidation([
    () => validateRequired(payload, ['item_id', 'name']),
    () => optionalTextField(payload, ['name']),
    () => optionalNonNegativeDecimal(payload, ['price_modifier']),
  ]);
}

export function validateUpdateMenuItemModifier(payload: Partial<MenuItemModifierPayload>) {
  runValidation([
    () => optionalTextField(payload, ['name']),
    () => optionalNonNegativeDecimal(payload, ['price_modifier']),
  ]);
}
