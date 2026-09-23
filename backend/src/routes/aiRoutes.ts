import { Router } from 'express';
import {
  generateEventDescription,
  generateSpeakerBio,
  generateSessionSummary,
  recommendSessions,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/generate-event-description', generateEventDescription);
router.post('/generate-speaker-bio', generateSpeakerBio);
router.post('/generate-session-summary', generateSessionSummary);
router.post('/recommend-sessions', recommendSessions);

export default router;
