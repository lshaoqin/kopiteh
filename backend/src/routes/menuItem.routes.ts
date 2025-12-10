import { Router } from 'express';
import { MenuItemController } from '../controllers/menuItem.controller';
import {
  createMenuItemValidation,
  updateMenuItemValidation,
  menuItemIdParamValidation,
  runValidation,
} from '../middleware/menuItem.validation'
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/items/stalls/:stall_id', menuItemIdParamValidation, MenuItemController.getAll);
router.get('/items/:id', menuItemIdParamValidation, runValidation, MenuItemController.getById);

// Protected writes
router.post('/items/create', authenticateToken, createMenuItemValidation, runValidation, MenuItemController.create);
router.put('/items/update/:id', authenticateToken, ...updateMenuItemValidation, runValidation, MenuItemController.update);
router.delete('/items/remove/:id', authenticateToken, menuItemIdParamValidation, runValidation, MenuItemController.remove);

export default router;
