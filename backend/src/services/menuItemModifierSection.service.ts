import type { MenuItemModifierSectionPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

const SECTION_COLUMNS = new Set(['item_id', 'name', 'min_selections', 'max_selections']);

export const MenuItemModifierSectionService = {
  async findAllByItem(itemId: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM menu_item_modifier_section WHERE item_id = $1 ORDER BY section_id ASC',
        [itemId]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM menu_item_modifier_section WHERE section_id = $1',
        [id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier section not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: MenuItemModifierSectionPayload): Promise<ServiceResult<any>> {
    try {
      const query = `
        INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;
      const values = [
        payload.item_id,
        payload.name,
        payload.min_selections ?? 0,
        payload.max_selections ?? 0,
      ];
      const result = await BaseService.query(query, values);
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: Partial<MenuItemModifierSectionPayload>): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => SECTION_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    try {
      const result = await BaseService.query(
        `UPDATE menu_item_modifier_section SET ${setClause} WHERE section_id = $${entries.length + 1} RETURNING *`,
        [...values, id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier section not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'DELETE FROM menu_item_modifier_section WHERE section_id = $1',
        [id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Modifier section not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};