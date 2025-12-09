import { Router } from 'express';
import { MenuItemModifierSectionController } from '../controllers/menuItemModifierSection.controller';
import {
  createSectionValidation,
  updateSectionValidation,
  sectionIdParamValidation,
  runValidation,
} from '../middleware/menuItemModifierSection.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/sections/items/:item_id', sectionIdParamValidation, MenuItemModifierSectionController.getAll);
router.get('/sections/:id', sectionIdParamValidation, runValidation, MenuItemModifierSectionController.getById);

// Protected writes
router.post('/sections/create', authenticateToken, createSectionValidation, runValidation, MenuItemModifierSectionController.create);
router.put('/sections/update/:id', authenticateToken, ...updateSectionValidation, runValidation, MenuItemModifierSectionController.update);
router.delete('/sections/remove/:id', authenticateToken, sectionIdParamValidation, runValidation, MenuItemModifierSectionController.remove);

export default router;
