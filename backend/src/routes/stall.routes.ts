import { Router } from 'express';
import { StallController } from '../controllers/stall.controller';
import {
  createStallValidation,
  updateStallValidation,
  stallIdParamValidation,
  runValidation,
} from '../middleware/stall.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/venues/:venue_id/stalls', stallIdParamValidation, StallController.getAll);
router.get('/stalls/:id', stallIdParamValidation, runValidation, StallController.getById);

// Protected writes
router.post('/stalls', authenticateToken, createStallValidation, runValidation, StallController.create);
router.put('/stalls/:id', authenticateToken, updateStallValidation, runValidation, StallController.update);
router.delete('/stalls/:id', authenticateToken, stallIdParamValidation, runValidation, StallController.remove);

export default router;
