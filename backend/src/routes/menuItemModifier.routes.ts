import { Router } from 'express';
import { MenuItemModifierController } from '../controllers/menuItemModifier.controller';
import {
  createModifierValidation,
  updateModifierValidation,
  modifierIdParamValidation,
  runValidation,
} from '../middleware/menuItemModifier.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/modifiers/items/:item_id', modifierIdParamValidation, MenuItemModifierController.getAll);
router.get('/modifiers/:id', modifierIdParamValidation, runValidation, MenuItemModifierController.getById);

// Protected writes
router.post('/modifiers/create', authenticateToken, createModifierValidation, runValidation, MenuItemModifierController.create);
router.put('/modifiers/update/:id', authenticateToken, ...updateModifierValidation, runValidation, MenuItemModifierController.update);
router.delete('/modifiers/remove/:id', authenticateToken, modifierIdParamValidation, runValidation, MenuItemModifierController.remove);

export default router;
