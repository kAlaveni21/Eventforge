import { Response } from 'express';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

// @desc    Get all events (public or filtered)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by organizer (for "My Events" view)
    if (req.query.organizer) {
      query.organizer = req.query.organizer;
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Filter by eventType
    if (req.query.eventType && req.query.eventType !== 'all') {
      query.eventType = req.query.eventType;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Date filters
    if (req.query.upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    // Sorting
    let sort: any = { startDate: 1 };
    if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sortBy === 'popular') {
      sort = { attendees: -1 };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('venue', 'name location address capacity')
      .populate('organizer', 'name email company avatar')
      .populate('speakers', 'name designation company profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    sendPagination(res, events, total, page, limit, 'Events retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch events', 500, err);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venue')
      .populate('organizer', 'name email company avatar phone')
      .populate('speakers')
      .populate('sponsors')
      .populate({
        path: 'sessions',
        populate: { path: 'speaker', select: 'name designation company profileImage' },
      })
      .populate('assignedStaff', 'name email phone role');

    if (!event) {
      sendError(res, 'Event not found', 404);
      return;
    }

    // Also attach tickets available for this event
    const tickets = await Ticket.find({ event: event._id });

    sendSuccess(
      res,
      {
        ...event.toObject(),
        tickets,
      },
      'Event details retrieved'
    );
  } catch (err: any) {
    sendError(res, 'Failed to fetch event', 500, err);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      eventType,
      category,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      venue,
      capacity,
      bannerImage,
      status,
      assignedStaff,
      tickets,
    } = req.body;

    if (!title || !description || !startDate || !endDate || !capacity) {
      sendError(res, 'Please provide title, description, dates, and capacity', 400);
      return;
    }

    const event = await Event.create({
      title,
      description,
      eventType: eventType || 'Conference',
      category: category || 'Technology',
      startDate,
      endDate,
      registrationStart: registrationStart || startDate,
      registrationEnd: registrationEnd || endDate,
      venue: venue || undefined,
      organizer: req.user?._id,
      capacity: Number(capacity),
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      status: status || 'PUBLISHED',
      assignedStaff: assignedStaff || [],
    });

    // Optionally create default tickets if passed in payload
    if (Array.isArray(tickets) && tickets.length > 0) {
      const ticketDocs = tickets.map((t: any) => ({
        event: event._id,
        name: t.name,
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 100,
        benefits: t.benefits || [],
      }));
      await Ticket.insertMany(ticketDocs);
    } else {
      // Create standard default tickets for convenience
      await Ticket.insertMany([
        {
          event: event._id,
          name: 'Standard',
          price: 99,
          quantity: Math.floor(Number(capacity) * 0.7),
          benefits: ['General Conference Access', 'Event Keynote Pass', 'Digital Handouts'],
        },
        {
          event: event._id,
          name: 'VIP',
          price: 249,
          quantity: Math.floor(Number(capacity) * 0.2),
          benefits: ['All Standard Benefits', 'VIP Lounge Access', 'Networking Dinner', 'Speaker Q&A Priority'],
        },
        {
          event: event._id,
          name: 'Student',
          price: 29,
          quantity: Math.floor(Number(capacity) * 0.1),
          benefits: ['General Conference Access', 'Student Workshop Access'],
        },
      ]);
    }

    sendSuccess(res, event, 'Event created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create event', 500, err);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer, Admin)
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      sendError(res, 'Event not found', 404);
      return;
    }

    // Authorization check
    if (
      req.user?.role !== 'PLATFORM_ADMIN' &&
      event.organizer.toString() !== req.user?._id.toString()
    ) {
      sendError(res, 'Not authorized to update this event', 403);
      return;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, event, 'Event updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update event', 500, err);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer, Admin)
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      sendError(res, 'Event not found', 404);
      return;
    }

    // Authorization check
    if (
      req.user?.role !== 'PLATFORM_ADMIN' &&
      event.organizer.toString() !== req.user?._id.toString()
    ) {
      sendError(res, 'Not authorized to delete this event', 403);
      return;
    }

    await event.deleteOne();
    sendSuccess(res, null, 'Event deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete event', 500, err);
  }
};
