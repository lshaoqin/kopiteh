import type { VenuePayload, UpdateVenuePayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

const VENUE_COLUMNS = new Set(['name', 'address', 'description', 'image_url', 'opening_hours']);

export const VenueService = {
  async findAll(): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query('SELECT * FROM venue');
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * FROM venue WHERE venue_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: VenuePayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'INSERT INTO venue (name, address, description, image_url, opening_hours) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          payload.name,
          payload.address ?? null,
          payload.description ?? null,
          payload.image_url ?? null,
          payload.opening_hours ?? null,
        ],
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateVenuePayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => VENUE_COLUMNS.has(key));
    if (entries.length === 0) return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries
      .map(([field], index) => `${field} = $${index + 1}`)
      .join(', ');
    const values = entries.map(([, value]) => value ?? null);

    try {
      const query = `UPDATE venue SET ${setClause} WHERE venue_id = $${entries.length + 1} RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query('DELETE FROM venue WHERE venue_id = $1', [id]);
      if (result.rowCount === 0) return errorResponse(ErrorCodes.NOT_FOUND, 'Venue not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findTables(id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM "table" WHERE venue_id = $1 ORDER BY table_number::INTEGER ASC',
        [id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
