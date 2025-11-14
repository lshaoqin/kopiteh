import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import {
  createOrderValidation,
  updateOrderValidation,
  orderIdParamValidation,
  runValidation,
} from '../middleware/order.validation'
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/user/:user_id/order', orderIdParamValidation, OrderController.getAll);
router.get('/order/:id', orderIdParamValidation, runValidation, OrderController.getById);

// Protected writes
router.post('/order', authenticateToken, createOrderValidation, runValidation, OrderController.create);
router.put('/order/:id', authenticateToken, updateOrderValidation, runValidation, OrderController.update);
router.delete('/order/:id', authenticateToken, orderIdParamValidation, runValidation, OrderController.remove);

export default router;