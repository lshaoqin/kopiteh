import type { VenuePayload, UpdateVenuePayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

export const VenueService = {
  async findAll(): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query('SELECT * FROM venue');
      return successResponse(SuccessCodes.OK, result.rows);
    }
    catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    const result = await BaseService.query('SELECT * FROM venue WHERE venue_id = $1', [id]);
    if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
    return successResponse(SuccessCodes.OK, result.rows[0]);
  },

  async create(payload: VenuePayload): Promise<ServiceResult<any>> {
    try{
      const result = await BaseService.query(
        'INSERT INTO venue (name, address, description, image_url, opening_hours) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [payload.name, payload.address || null, payload.description || null, payload.image_url || null, payload.opening_hours || null]
      );
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateVenuePayload): Promise<ServiceResult<any>> {
    const fields = Object.keys(payload);
    if (fields.length === 0) return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No fields to update');
    const values = Object.values(payload);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const q = `UPDATE venue SET ${set} WHERE venue_id = $${fields.length + 1} RETURNING *`;
    const result = await BaseService.query(q, [...values, id]);
    if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
    return successResponse(SuccessCodes.OK, result.rows[0]);
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    const result = await BaseService.query('DELETE FROM venue WHERE venue_id = $1', [id]);
    if (result.rowCount === 0) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
    return successResponse<null>(SuccessCodes.OK, null);
  }
};
