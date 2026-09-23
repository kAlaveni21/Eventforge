import { Response } from 'express';
import Ticket from '../models/Ticket.js';
import Coupon from '../models/Coupon.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get tickets for an event
// @route   GET /api/tickets
// @access  Public
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.event) {
      query.event = req.query.event;
    }
    const tickets = await Ticket.find(query).populate('event', 'title startDate capacity');
    sendSuccess(res, tickets, 'Tickets retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch tickets', 500, err);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Public
export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) {
      sendError(res, 'Ticket not found', 404);
      return;
    }
    sendSuccess(res, ticket, 'Ticket retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch ticket', 500, err);
  }
};

// @desc    Create ticket type
// @route   POST /api/tickets
// @access  Private (Organizer, Admin)
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { event, name, price, quantity, benefits } = req.body;

    if (!event || !name || price === undefined || !quantity) {
      sendError(res, 'Please provide event, name, price, and quantity', 400);
      return;
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      sendError(res, 'Event not found', 404);
      return;
    }

    const ticket = await Ticket.create({
      event,
      name,
      price: Number(price),
      quantity: Number(quantity),
      benefits: Array.isArray(benefits) ? benefits : [],
    });

    sendSuccess(res, ticket, 'Ticket created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create ticket', 500, err);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Organizer, Admin)
export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ticket) {
      sendError(res, 'Ticket not found', 404);
      return;
    }
    sendSuccess(res, ticket, 'Ticket updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update ticket', 500, err);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Organizer, Admin)
export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      sendError(res, 'Ticket not found', 404);
      return;
    }
    await ticket.deleteOne();
    sendSuccess(res, null, 'Ticket deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete ticket', 500, err);
  }
};

// @desc    Validate coupon code
// @route   POST /api/tickets/validate-coupon
// @access  Public
export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, eventId } = req.body;

    if (!code) {
      sendError(res, 'Please provide coupon code', 400);
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      sendError(res, 'Invalid coupon code', 400);
      return;
    }

    // Check validity date
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      sendError(res, 'Coupon has expired', 400);
      return;
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      sendError(res, 'Coupon usage limit reached', 400);
      return;
    }

    // Check event specific coupon
    if (coupon.event && eventId && coupon.event.toString() !== eventId.toString()) {
      sendError(res, 'Coupon is not valid for this event', 400);
      return;
    }

    sendSuccess(
      res,
      {
        id: coupon._id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount,
      },
      'Coupon is valid!'
    );
  } catch (err: any) {
    sendError(res, 'Coupon validation failed', 500, err);
  }
};
