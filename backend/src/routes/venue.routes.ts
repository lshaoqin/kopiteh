import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';
import { runValidation } from '../middleware/base.validation';
import {
  createVenueValidation,
  updateVenueValidation,
  venueIdParamValidation,
} from '../middleware/venue.validation';

const router = Router();

router.get('/', VenueController.getAll);
router.get('/:id', venueIdParamValidation, runValidation, VenueController.getById);
router.post('/', createVenueValidation, runValidation, VenueController.create);
router.put(
  '/:id',
  [...venueIdParamValidation, ...updateVenueValidation],
  runValidation,
  VenueController.update,
);
router.delete('/:id', venueIdParamValidation, runValidation, VenueController.remove);

export default router;
