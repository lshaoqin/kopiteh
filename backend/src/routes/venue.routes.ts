import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';
import { runValidation } from '../middleware/base.validation';
import {
  createVenueValidation,
  updateVenueValidation,
  venueIdParamValidation,
} from '../middleware/venue.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/venue', VenueController.getAll);
router.get('/venue/:id/tables', venueIdParamValidation, runValidation, VenueController.getTables);
router.get('/venue/:id', venueIdParamValidation, runValidation, VenueController.getById);
router.post('/venue/create', authenticateToken, createVenueValidation, runValidation, VenueController.create);
router.patch('/venue/update/:id', authenticateToken, ...updateVenueValidation, runValidation, VenueController.update);
router.delete('/venue/remove/:id', authenticateToken, venueIdParamValidation, runValidation, VenueController.remove);

export default router;
