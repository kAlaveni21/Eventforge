import { Router } from 'express';
import {
  getSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getPackages,
} from '../controllers/sponsorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getSponsors);
router.get('/packages', getPackages);
router.get('/:id', getSponsorById);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createSponsor
);

router.put('/:id', protect, updateSponsor);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteSponsor
);

export default router;
