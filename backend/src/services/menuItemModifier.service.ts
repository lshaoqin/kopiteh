import type { MenuItemModifierPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

const MODIFIER_COLUMNS = new Set(['item_id', 'name', 'price_modifier', 'is_available']);

export const MenuItemModifierService = {
  async findAllByItem(itemId: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM menu_item_modifier WHERE item_id = $1 ORDER BY option_id ASC',
        [itemId]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * FROM menu_item_modifier WHERE option_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: MenuItemModifierPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        `INSERT INTO menu_item_modifier (item_id, name, price_modifier, is_available)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [payload.item_id, payload.name, payload.price_modifier ?? 0, payload.is_available ?? true]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: Partial<MenuItemModifierPayload>): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => MODIFIER_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    try {
      const result = await BaseService.query(
        `UPDATE menu_item_modifier SET ${setClause} WHERE option_id = $${entries.length + 1} RETURNING *`,
        [...values, id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query('DELETE FROM menu_item_modifier WHERE option_id = $1', [id]);
      if (result.rowCount === 0) return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};