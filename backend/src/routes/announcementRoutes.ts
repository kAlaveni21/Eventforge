import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getAnnouncements);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createAnnouncement
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteAnnouncement
);

export default router;
