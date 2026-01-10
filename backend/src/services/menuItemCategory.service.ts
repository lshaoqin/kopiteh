import type { MenuItemCategoryPayload, UpdateMenuItemCategoryPayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

const CATEGORY_COLUMNS = new Set(["stall_id", "name", "sort_order"]);

export const MenuItemCategoryService = {
  async findAllByStall(stall_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        `SELECT *
         FROM menu_item_category
         WHERE stall_id = $1
         ORDER BY sort_order ASC, category_id ASC`,
        [stall_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        `SELECT * FROM menu_item_category WHERE category_id = $1`,
        [id]
      );

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item category not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: MenuItemCategoryPayload): Promise<ServiceResult<any>> {
    const sortOrder =
      payload.sort_order ??
      (await this.nextSortOrderForStall(payload.stall_id));

    try {
      const result = await BaseService.query(
        `INSERT INTO menu_item_category (stall_id, name, sort_order)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [payload.stall_id, payload.name, sortOrder]
      );

      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateMenuItemCategoryPayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => CATEGORY_COLUMNS.has(key));
    if (entries.length === 0) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, "No valid fields to update");
    }

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(", ");
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE menu_item_category
                     SET ${setClause}
                     WHERE category_id = $${entries.length + 1}
                     RETURNING *`;

      const result = await BaseService.query(query, [...values, id]);

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item category not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        `DELETE FROM menu_item_category WHERE category_id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item category not found");
      }

      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async nextSortOrderForStall(stall_id: number): Promise<number> {
    const r = await BaseService.query(
      `SELECT COALESCE(MAX(sort_order), -1) AS max_sort
       FROM menu_item_category
       WHERE stall_id = $1`,
      [stall_id]
    );
    const maxSort = Number(r.rows?.[0]?.max_sort ?? -1);
    return maxSort + 1;
  },
};
