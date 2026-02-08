import { Router } from 'express';
import { OrderItemController } from '../controllers/orderItem.controller';
import {
  createOrderItemValidation,
  updateOrderItemValidation,
  typeParamValidation,
  orderItemIdParamValidation,
  orderIdParamValidation,
  stallIdParamValidation,
} from '../middleware/orderItem.validation'
import { runValidation } from '../middleware/base.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/orderItem/id/:type/:id', typeParamValidation, orderItemIdParamValidation, runValidation, OrderItemController.getById);
router.get('/orderItem/order/:order_id', orderIdParamValidation, runValidation, OrderItemController.getByOrder);
router.get('/orderItem/stall/:stall_id', stallIdParamValidation, runValidation, OrderItemController.getByStall); // for runners

// Public writes
router.put('/orderItem/update/:type/:id', typeParamValidation, ...updateOrderItemValidation, runValidation, OrderItemController.update);
router.put('/orderItem/updateStatus/:type/:id', typeParamValidation, orderItemIdParamValidation, runValidation, OrderItemController.updateStatus);
router.put('/orderItem/revertStatus/:type/:id', typeParamValidation, orderItemIdParamValidation, runValidation, OrderItemController.revertStatus);
router.put('/orderItem/cancel/:type/:id', typeParamValidation, orderItemIdParamValidation, runValidation, OrderItemController.cancel);
router.delete('/orderItem/delete/:type/:id', typeParamValidation, orderItemIdParamValidation, runValidation, OrderItemController.remove);
router.post('/orderItem/create/:type', typeParamValidation, createOrderItemValidation, runValidation, OrderItemController.create);

export default router;