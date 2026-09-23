import { Response } from 'express';
import crypto from 'crypto';
import Registration from '../models/Registration.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import Coupon from '../models/Coupon.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { generateQRCode } from '../utils/generateQRCode.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Attendee, Admin)
export const createRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { event: eventId, ticket: ticketId, couponCode } = req.body;
    const attendeeId = req.user?._id;

    if (!eventId || !ticketId) {
      sendError(res, 'Please provide event and ticket ID', 400);
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      sendError(res, 'Event not found', 404);
      return;
    }

    // Check if registration window is open
    const now = new Date();
    if (event.registrationEnd && new Date(event.registrationEnd) < now) {
      sendError(res, 'Registration for this event has ended', 400);
      return;
    }

    // Check existing confirmed registration for this user
    const existing = await Registration.findOne({
      event: eventId,
      attendee: attendeeId,
      status: { $ne: 'CANCELLED' },
    });
    if (existing) {
      sendError(res, 'You are already registered for this event', 400);
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 'Ticket type not found', 404);
      return;
    }

    if (ticket.sold >= ticket.quantity) {
      sendError(res, 'This ticket category is sold out', 400);
      return;
    }

    // Calculate pricing and apply coupon
    let finalAmount = ticket.price;
    let couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (couponDoc && (!couponDoc.validUntil || new Date(couponDoc.validUntil) >= now)) {
        if (!couponDoc.maxUses || couponDoc.usedCount < couponDoc.maxUses) {
          const discount = (finalAmount * couponDoc.discountPercent) / 100;
          finalAmount = Math.max(0, finalAmount - discount);
          couponDoc.usedCount += 1;
          await couponDoc.save();
        }
      }
    }

    // Generate unique Registration ID
    const registrationId = `EF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Payload to encode in QR code
    const qrPayload = JSON.stringify({
      regId: registrationId,
      eventId: event._id.toString(),
      eventTitle: event.title,
      attendeeId: attendeeId.toString(),
      attendeeName: req.user?.name,
      ticketType: ticket.name,
      timestamp: Date.now(),
    });

    const qrCode = await generateQRCode(qrPayload);

    const registration = await Registration.create({
      registrationId,
      attendee: attendeeId,
      event: eventId,
      ticket: ticketId,
      coupon: couponDoc?._id,
      amount: finalAmount,
      status: 'CONFIRMED',
      approvalStatus: 'APPROVED',
      qrCode,
      registeredAt: new Date(),
    });

    // Update ticket sold count and event attendees list
    ticket.sold += 1;
    await ticket.save();

    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { attendees: attendeeId },
    });

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event', 'title startDate endDate bannerImage venue location')
      .populate('ticket', 'name price benefits')
      .populate('attendee', 'name email company avatar');

    sendSuccess(res, populatedRegistration, 'Registration successful', 201);
  } catch (err: any) {
    sendError(res, 'Registration failed', 500, err);
  }
};

// @desc    Get registrations (Attendee sees own; Organizer/Admin can filter by event)
// @route   GET /api/registrations
// @access  Private
export const getRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.user?.role === 'ATTENDEE') {
      query.attendee = req.user._id;
    } else {
      if (req.query.event) {
        query.event = req.query.event;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
    }

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate('event', 'title startDate endDate bannerImage venue')
      .populate('ticket', 'name price benefits')
      .populate('attendee', 'name email company avatar phone')
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    sendPagination(res, registrations, total, page, limit, 'Registrations retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch registrations', 500, err);
  }
};

// @desc    Get single registration by ID
// @route   GET /api/registrations/:id
// @access  Private
export const getRegistrationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('ticket')
      .populate('attendee', 'name email company phone avatar');

    if (!registration) {
      sendError(res, 'Registration not found', 404);
      return;
    }

    // Authorization: owner or admin/organizer
    const isOwner = req.user?._id.toString() === registration.attendee._id.toString();
    const isStaffOrAbove = ['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'].includes(
      req.user?.role || ''
    );

    if (!isOwner && !isStaffOrAbove) {
      sendError(res, 'Not authorized to view this registration', 403);
      return;
    }

    sendSuccess(res, registration, 'Registration details retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch registration', 500, err);
  }
};

// @desc    Update registration status (Approve, Reject, Cancel)
// @route   PUT /api/registrations/:id
// @access  Private (Organizer, Admin, Attendee cancel own)
export const updateRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      sendError(res, 'Registration not found', 404);
      return;
    }

    const { status, approvalStatus } = req.body;
    const isOwner = req.user?._id.toString() === registration.attendee.toString();
    const isOrganizerOrAdmin = ['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(
      req.user?.role || ''
    );

    if (isOwner && status === 'CANCELLED') {
      registration.status = 'CANCELLED';
      registration.approvalStatus = 'CANCELLED';
    } else if (isOrganizerOrAdmin) {
      if (status) registration.status = status;
      if (approvalStatus) registration.approvalStatus = approvalStatus;
    } else {
      sendError(res, 'Not authorized to update this registration', 403);
      return;
    }

    await registration.save();
    sendSuccess(res, registration, 'Registration updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update registration', 500, err);
  }
};

// @desc    Delete registration
// @route   DELETE /api/registrations/:id
// @access  Private (Admin)
export const deleteRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      sendError(res, 'Registration not found', 404);
      return;
    }

    // Decrement ticket count
    await Ticket.findByIdAndUpdate(registration.ticket, { $inc: { sold: -1 } });
    await Event.findByIdAndUpdate(registration.event, { $pull: { attendees: registration.attendee } });

    await registration.deleteOne();
    sendSuccess(res, null, 'Registration deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete registration', 500, err);
  }
};
