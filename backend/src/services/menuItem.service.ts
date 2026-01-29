import type { MenuItemPayload, UpdateMenuItemPayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

const ITEM_COLUMNS = new Set([
  "stall_id",
  "category_id",
  "item_image",
  "name",
  "description",
  "price",
  "prep_time",
  "is_available",
]);

export const MenuItemService = {
  async findAllByStall(
    stall_id: number,
    category_id?: number,
  ): Promise<ServiceResult<any[]>> {
    try {
      const hasCategoryFilter =
        typeof category_id === "number" && !Number.isNaN(category_id);

      const result = await BaseService.query(
        hasCategoryFilter
          ? `SELECT * FROM menu_item WHERE stall_id = $1 AND category_id = $2 ORDER BY item_id ASC`
          : `SELECT * FROM menu_item WHERE stall_id = $1 ORDER BY item_id ASC`,
        hasCategoryFilter ? [stall_id, category_id] : [stall_id],
      );

      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM menu_item WHERE item_id = $1",
        [id],
      );

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findDefault(stall_id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        `SELECT * FROM menu_item WHERE stall_id = $1 AND name = 'Default Item' LIMIT 1`,
        [stall_id]
      );
      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Default menu item not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: MenuItemPayload): Promise<ServiceResult<any>> {
    try {
      const item = await BaseService.tx(async (client) => {
        // 1) create item
        const itemRes = await client.query(
          `INSERT INTO menu_item (
           stall_id, category_id, item_image, name, description, price, prep_time, is_available
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
          [
            payload.stall_id,
            payload.category_id ?? null,
            payload.item_image ?? null,
            payload.name,
            payload.description ?? null,
            payload.price,
            payload.prep_time ?? 0,
            payload.is_available ?? true,
          ],
        );

        const createdItem = itemRes.rows[0];
        const itemId = createdItem.item_id;

        // 2) create modifier sections + options (optional)
        for (const s of payload.modifier_sections ?? []) {
          const secRes = await client.query(
            `INSERT INTO menu_item_modifier_section (
             item_id, name, min_selections, max_selections
           )
           VALUES ($1,$2,$3,$4)
           RETURNING section_id`,
            [
              itemId,
              s.name.trim(),
              Number(s.min_selections),
              Number(s.max_selections),
            ],
          );

          const sectionId = secRes.rows[0].section_id;

          for (const o of s.options ?? []) {
            await client.query(
              `INSERT INTO menu_item_modifier (
               section_id, item_id, name, price_modifier, is_available
             )
             VALUES ($1,$2,$3,$4,$5)`,
              [
                sectionId,
                itemId,
                o.name.trim(),
                Number(o.price_modifier),
                o.is_available ?? true,
              ],
            );
          }
        }

        return createdItem;
      });

      return successResponse(SuccessCodes.CREATED, item);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(
    id: number,
    payload: UpdateMenuItemPayload,
  ): Promise<ServiceResult<any>> {
    try {
      const updatedItem = await BaseService.tx(async (client) => {
        const baseEntries = Object.entries(payload).filter(
          ([key]) => key !== "modifier_sections" && ITEM_COLUMNS.has(key),
        );

        let itemRow: any = null;

        if (baseEntries.length > 0) {
          const setClause = baseEntries
            .map(([field], i) => `${field} = $${i + 1}`)
            .join(", ");
          const values = baseEntries.map(([, v]) => v ?? null);

          const query = `UPDATE menu_item SET ${setClause} WHERE item_id = $${
            baseEntries.length + 1
          } RETURNING *`;

          const itemRes = await client.query(query, [...values, id]);
          itemRow = itemRes.rows[0];

          if (!itemRow) {
            // no item
            throw new Error("NOT_FOUND: Menu item not found");
          }
        } else {
          // no base updates—still need to verify item exists if we're syncing modifiers
          const itemRes = await client.query(
            "SELECT * FROM menu_item WHERE item_id = $1",
            [id],
          );
          itemRow = itemRes.rows[0];
          if (!itemRow) throw new Error("NOT_FOUND: Menu item not found");
        }

        if (payload.modifier_sections) {
          const nextSections = payload.modifier_sections;

          // Load current sections
          const secRes = await client.query(
            `SELECT section_id FROM menu_item_modifier_section WHERE item_id = $1`,
            [id],
          );
          const currentSectionIds = new Set<number>(
            secRes.rows.map((r) => r.section_id),
          );

          // Load current options
          const optRes = await client.query(
            `SELECT option_id FROM menu_item_modifier WHERE item_id = $1`,
            [id],
          );
          const currentOptionIds = new Set<number>(
            optRes.rows.map((r) => r.option_id),
          );

          // Next ids
          const nextSectionIds = new Set<number>();
          const nextOptionIds = new Set<number>();

          for (const s of nextSections) {
            if (s.section_id) nextSectionIds.add(Number(s.section_id));
            for (const o of s.options ?? []) {
              if (o.option_id) nextOptionIds.add(Number(o.option_id));
            }
          }

          // 1) delete removed options first (safe even if section delete cascades)
          for (const optionId of currentOptionIds) {
            if (!nextOptionIds.has(optionId)) {
              await client.query(
                `DELETE FROM menu_item_modifier WHERE option_id = $1 AND item_id = $2`,
                [optionId, id],
              );
            }
          }

          // 2) delete removed sections (cascade deletes options by FK)
          for (const sectionId of currentSectionIds) {
            if (!nextSectionIds.has(sectionId)) {
              await client.query(
                `DELETE FROM menu_item_modifier_section WHERE section_id = $1 AND item_id = $2`,
                [sectionId, id],
              );
            }
          }

          // 3) upsert sections + options
          for (const s of nextSections) {
            let sectionId: number;

            if (s.section_id) {
              sectionId = Number(s.section_id);
              await client.query(
                `UPDATE menu_item_modifier_section
               SET name=$1, min_selections=$2, max_selections=$3
               WHERE section_id=$4 AND item_id=$5`,
                [
                  s.name.trim(),
                  Number(s.min_selections),
                  Number(s.max_selections),
                  sectionId,
                  id,
                ],
              );
            } else {
              const insSec = await client.query(
                `INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections)
               VALUES ($1,$2,$3,$4)
               RETURNING section_id`,
                [
                  id,
                  s.name.trim(),
                  Number(s.min_selections),
                  Number(s.max_selections),
                ],
              );
              sectionId = insSec.rows[0].section_id;
            }

            for (const o of s.options ?? []) {
              if (o.option_id) {
                await client.query(
                  `UPDATE menu_item_modifier
                 SET name=$1, price_modifier=$2, is_available=$3, section_id=$4
                 WHERE option_id=$5 AND item_id=$6`,
                  [
                    o.name.trim(),
                    Number(o.price_modifier),
                    o.is_available ?? true,
                    sectionId,
                    Number(o.option_id),
                    id,
                  ],
                );
              } else {
                await client.query(
                  `INSERT INTO menu_item_modifier (section_id, item_id, name, price_modifier, is_available)
                 VALUES ($1,$2,$3,$4,$5)`,
                  [
                    sectionId,
                    id,
                    o.name.trim(),
                    Number(o.price_modifier),
                    o.is_available ?? true,
                  ],
                );
              }
            }
          }
        }

        return itemRow;
      });

      return successResponse(SuccessCodes.OK, updatedItem);
    } catch (error: any) {
      if (
        typeof error?.message === "string" &&
        error.message.startsWith("NOT_FOUND:")
      ) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        "DELETE FROM menu_item WHERE item_id = $1",
        [id],
      );

      if (result.rowCount === 0) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }

      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
