import { Router } from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  toggleAttendeeSchedule,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getSessions);
router.get('/:id', getSessionById);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createSession
);

router.put(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'SPEAKER'),
  updateSession
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteSession
);

router.post('/:id/schedule', protect, toggleAttendeeSchedule);

export default router;
