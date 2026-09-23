import { Router } from 'express';
import {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createVenue
);

router.put(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  updateVenue
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteVenue
);

export default router;
