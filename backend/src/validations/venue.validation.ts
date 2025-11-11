import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { VenuePayload, UpdateVenuePayload } from '../types/payloads';

export function validateCreateVenue(payload: VenuePayload) {
  runValidation([
    () => validateRequired(payload, ['name']),
    () => optionalTextField(payload, ['address', 'description', 'image_url', 'opening_hours']),
  ]);
}

export function validateUpdateVenue(payload: UpdateVenuePayload) {
  runValidation([
    () => optionalTextField(payload, ['name', 'address', 'description', 'image_url', 'opening_hours']),
  ]);
}
