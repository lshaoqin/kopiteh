import { validateRequired, optionalTextField, runValidation } from "./base.validation";
import type { MenuItemModifierSectionPayload } from "../types/payloads";
import { BadRequestError } from "../controllers/errors";

function optionalNonNegativeNumbers(obj: any, fields: string[]) {
  for (const f of fields) {
    if (obj[f] !== undefined && typeof obj[f] !== "number")
      throw new BadRequestError(`${f} must be a number`, { field: f });
    if (obj[f] !== undefined && obj[f] < 0)
      throw new BadRequestError(`${f} cannot be negative`, { field: f });
  }
}

function ensureMaxGEmin(obj: any, minKey: string, maxKey: string) {
  const min = obj[minKey];
  const max = obj[maxKey];
  if (min !== undefined && max !== undefined && max < min) {
    throw new BadRequestError(`${maxKey} must be >= ${minKey}`, { min, max });
  }
}

export function validateCreateMenuItemModifierSection(payload: MenuItemModifierSectionPayload) {
  runValidation([
    () => validateRequired(payload, ["item_id", "name"]),
    () => optionalTextField(payload, ["name"]),
    () => optionalNonNegativeNumbers(payload, ["min_selections", "max_selections"]),
    () => ensureMaxGEmin(payload, "min_selections", "max_selections"),
  ]);
}

export function validateUpdateMenuItemModifierSection(payload: Partial<MenuItemModifierSectionPayload>) {
  runValidation([
    () => optionalTextField(payload, ["name"]),
    () => optionalNonNegativeNumbers(payload, ["min_selections", "max_selections"]),
    () => ensureMaxGEmin(payload, "min_selections", "max_selections"),
  ]);
}
