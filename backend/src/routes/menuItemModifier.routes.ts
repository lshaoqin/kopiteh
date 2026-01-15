import { Router } from "express";
import { MenuItemModifierController } from "../controllers/menuItemModifier.controller";
import {
  createModifierValidation,
  updateModifierValidation,
  modifierIdParamValidation,
  itemIdParamValidation,
  sectionIdParamValidation,
  runValidation,
} from "../middleware/menuItemModifier.validation";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public reads
router.get("/modifiers/sections/:section_id", sectionIdParamValidation, runValidation, MenuItemModifierController.getAllBySection);
router.get("/modifiers/items/:item_id", itemIdParamValidation, runValidation, MenuItemModifierController.getAllByItem);
router.get("/modifiers/:id", modifierIdParamValidation, runValidation, MenuItemModifierController.getById);

// Protected writes
router.post("/modifiers/create", authenticateToken, createModifierValidation, runValidation, MenuItemModifierController.create);
router.put("/modifiers/update/:id", authenticateToken, modifierIdParamValidation, ...updateModifierValidation, runValidation, MenuItemModifierController.update);
router.delete("/modifiers/remove/:id", authenticateToken, modifierIdParamValidation, runValidation, MenuItemModifierController.remove);

export default router;
