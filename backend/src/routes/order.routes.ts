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
router.get('/order/user/:user_id', orderIdParamValidation, OrderController.getByUser);
router.get('/order/stall/:stall_id', orderIdParamValidation, OrderController.getByStall); // For runners
router.get('/order/:id', orderIdParamValidation, runValidation, OrderController.getById);

// Public writes
router.post('/order', authenticateToken, createOrderValidation, runValidation, OrderController.create);
router.put('/order/:id', authenticateToken, updateOrderValidation, runValidation, OrderController.update);
router.put('/order/:id', authenticateToken, orderIdParamValidation, runValidation, OrderController.cancel);

export default router;