import { Router } from 'express';
import { StallController } from '../controllers/stall.controller';
import {
  createStallValidation,
  updateStallValidation,
  stallIdParamValidation,
  venueIdParamValidation,
  runValidation,
} from '../middleware/stall.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/stalls/venue/:venue_id', venueIdParamValidation, StallController.getAll);
router.get('/stalls/:id', stallIdParamValidation, runValidation, StallController.getById);

// Protected writes
router.post('/stalls/create', authenticateToken, createStallValidation, runValidation, StallController.create);
router.put('/stalls/update/:id', authenticateToken, ...updateStallValidation, runValidation, StallController.update);
router.delete('/stalls/remove/:id', authenticateToken, stallIdParamValidation, runValidation, StallController.remove);

export default router;
