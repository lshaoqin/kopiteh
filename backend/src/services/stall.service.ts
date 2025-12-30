import type { StallPayload, UpdateStallPayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

const STALL_COLUMNS = new Set([
  "venue_id",
  "name",
  "description",
  "stall_image",
  "is_open",
  "waiting_time",
]);

export const StallService = {
  async findAllByVenue(venue_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM stall WHERE venue_id = $1 ORDER BY stall_id",
        [venue_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      console.error("[StallService.findAllByVenue] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM stall WHERE stall_id = $1",
        [id]
      );

      const stall = result.rows[0];
      if (!stall) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      }

      return successResponse(SuccessCodes.OK, stall);
    } catch (error) {
      console.error("[StallService.findById] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: StallPayload): Promise<ServiceResult<any>> {
    // allow only valid columns
    const entries = Object.entries(payload).filter(([key]) =>
      STALL_COLUMNS.has(key)
    );

    if (entries.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "No valid fields to create"
      );
    }

    const columns = entries.map(([field]) => field).join(", ");
    const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
    const values = entries.map(([, value]) => value ?? null);

    try {
      const query = `
      INSERT INTO stall (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

      const result = await BaseService.query(query, values);

      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      console.error("[StallService.create] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(
    id: number,
    payload: UpdateStallPayload
  ): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) =>
      STALL_COLUMNS.has(key)
    );

    if (entries.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "No valid fields to update"
      );
    }

    const setClause = entries
      .map(([field], i) => `${field} = $${i + 1}`)
      .join(", ");

    const values = entries.map(([, value]) => value ?? null);

    try {
      const query = `
      UPDATE stall
      SET ${setClause}
      WHERE stall_id = $${entries.length + 1}
      RETURNING *
    `;

      const result = await BaseService.query(query, [...values, id]);

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      console.error("[StallService.update] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        "DELETE FROM stall WHERE stall_id = $1",
        [id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
