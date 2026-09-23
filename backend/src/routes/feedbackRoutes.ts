import { Router } from 'express';
import {
  submitFeedback,
  getEventFeedback,
  getSessionFeedback,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, submitFeedback);
router.get('/event/:eventId', getEventFeedback);
router.get('/session/:sessionId', getSessionFeedback);

export default router;
