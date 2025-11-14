import { validateRequired, optionalTextField, runValidation } from './base.validation';
import type { StallPayload, UpdateStallPayload } from '../types/payloads';

export function validateCreateStall(payload: StallPayload) {
  runValidation([
    () => validateRequired(payload, ['venue_id', 'name']),
    () => optionalTextField(payload, ['description', 'stall_image']),
  ]);
}

export function validateUpdateStall(payload: UpdateStallPayload) {
  runValidation([
    () => optionalTextField(payload, [
      'venue_id',
      'name',
      'description',
      'stall_image',
    ]),
  ]);
}
