import { Router } from "express";
import { MenuItemModifierSectionController } from "../controllers/menuItemModifierSection.controller";
import {
  createSectionValidation,
  updateSectionValidation,
  sectionIdParamValidation,
  itemIdParamValidation,
  runValidation,
} from "../middleware/menuItemModifierSection.validation";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public reads
router.get("/item-sections/items/:item_id", itemIdParamValidation, runValidation, MenuItemModifierSectionController.getAll);
router.get("/item-sections/:id", sectionIdParamValidation, runValidation, MenuItemModifierSectionController.getById);

// Protected writes
router.post("/item-sections/create", authenticateToken, createSectionValidation, runValidation, MenuItemModifierSectionController.create);
router.put("/item-sections/update/:id", authenticateToken, sectionIdParamValidation, ...updateSectionValidation, runValidation, MenuItemModifierSectionController.update);
router.delete("/item-sections/remove/:id", authenticateToken, sectionIdParamValidation, runValidation, MenuItemModifierSectionController.remove);

export default router;
