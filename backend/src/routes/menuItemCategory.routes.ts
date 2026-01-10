// src/routes/menuItemCategory.routes.ts
import { Router } from "express";
import { MenuItemCategoryController } from "../controllers/menuItemCategory.controller";
import {
  createMenuItemCategoryValidation,
  updateMenuItemCategoryValidation,
  categoryIdParamValidation,
  stallIdParamValidation,
  runValidation,
} from "../middleware/menuItemCategory.validation";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public reads
router.get(
  "/categories/stalls/:stall_id",
  stallIdParamValidation,
  runValidation,
  MenuItemCategoryController.getAll
);

router.get(
  "/categories/:id",
  categoryIdParamValidation,
  runValidation,
  MenuItemCategoryController.getById
);

// Protected writes
router.post(
  "/categories/create",
  authenticateToken,
  createMenuItemCategoryValidation,
  runValidation,
  MenuItemCategoryController.create
);

router.put(
  "/categories/update/:id",
  authenticateToken,
  categoryIdParamValidation,
  ...updateMenuItemCategoryValidation,
  runValidation,
  MenuItemCategoryController.update
);

router.delete(
  "/categories/remove/:id",
  authenticateToken,
  categoryIdParamValidation,
  runValidation,
  MenuItemCategoryController.remove
);

export default router;