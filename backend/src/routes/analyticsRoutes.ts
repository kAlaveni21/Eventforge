import { Router } from 'express';
import {
  getEventAnalytics,
  getRegistrationAnalytics,
  getAttendanceAnalytics,
  getSessionAnalytics,
  getSponsorAnalytics,
  getAdminOverview,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(protect);

router.get('/admin/overview', authorizeRoles('PLATFORM_ADMIN'), getAdminOverview);

router.get(
  '/events/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getEventAnalytics
);

router.get(
  '/registrations/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getRegistrationAnalytics
);

router.get(
  '/attendance/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getAttendanceAnalytics
);

router.get(
  '/sessions/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getSessionAnalytics
);

router.get(
  '/sponsors/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getSponsorAnalytics
);

export default router;
