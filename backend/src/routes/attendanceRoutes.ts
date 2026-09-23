import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getEventAttendance,
  markSessionAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(protect);

router.post(
  '/check-in',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  checkIn
);

router.post(
  '/check-out',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  checkOut
);

router.get(
  '/event/:eventId',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  getEventAttendance
);

router.post(
  '/session',
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'),
  markSessionAttendance
);

export default router;
