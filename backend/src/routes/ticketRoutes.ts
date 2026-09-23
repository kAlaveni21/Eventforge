import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  validateCoupon,
} from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getTickets);
router.post('/validate-coupon', validateCoupon);
router.get('/:id', getTicketById);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createTicket
);

router.put(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  updateTicket
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteTicket
);

export default router;
