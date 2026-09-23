import { Response } from 'express';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper to check room and time conflict
const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  // Convert "HH:mm" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Overlap condition: start1 < end2 && end1 > start2
  return s1 < e2 && e1 > s2;
};

// @desc    Get all sessions (filtered by event, date, speaker, category)
// @route   GET /api/sessions
// @access  Public
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};

    if (req.query.event) {
      query.event = req.query.event;
    }
    if (req.query.speaker) {
      query.speaker = req.query.speaker;
    }
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    if (req.query.room) {
      query.room = req.query.room;
    }

    const sessions = await Session.find(query)
      .populate('speaker', 'name designation company profileImage bio')
      .populate('event', 'title startDate endDate venue')
      .sort({ date: 1, startTime: 1 });

    sendSuccess(res, sessions, 'Sessions retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch sessions', 500, err);
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Public
export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('speaker')
      .populate('event', 'title venue startDate endDate')
      .populate('attendees', 'name email company avatar');

    if (!session) {
      sendError(res, 'Session not found', 404);
      return;
    }

    sendSuccess(res, session, 'Session retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch session', 500, err);
  }
};

// @desc    Create new session with Conflict Detection
// @route   POST /api/sessions
// @access  Private (Organizer, Admin)
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      event,
      speaker,
      room,
      date,
      startTime,
      endTime,
      capacity,
      category,
    } = req.body;

    if (!title || !event || !room || !date || !startTime || !endTime || !capacity) {
      sendError(res, 'Please provide all required session fields (title, event, room, date, startTime, endTime, capacity)', 400);
      return;
    }

    // Normalize date to YYYY-MM-DD boundary
    const sessionDate = new Date(date);
    const startOfDay = new Date(sessionDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(sessionDate.setHours(23, 59, 59, 999));

    // Search for existing sessions in the SAME event & room on the SAME date
    const existingSessions = await Session.find({
      event,
      room: { $regex: new RegExp(`^${room.trim()}$`, 'i') },
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Check for conflict
    for (const existing of existingSessions) {
      if (checkTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        res.status(409).json({
          success: false,
          conflict: true,
          message: 'Session conflict: Another session is already scheduled in this room during this time.',
          conflictingSession: {
            title: existing.title,
            room: existing.room,
            startTime: existing.startTime,
            endTime: existing.endTime,
          },
        });
        return;
      }
    }

    const newSession = await Session.create({
      title,
      description: description || '',
      event,
      speaker: speaker || undefined,
      room: room.trim(),
      date: new Date(date),
      startTime,
      endTime,
      capacity: Number(capacity),
      category: category || 'General',
    });

    // Also link to Event sessions array
    await Event.findByIdAndUpdate(event, {
      $addToSet: { sessions: newSession._id },
    });

    sendSuccess(res, newSession, 'Session created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create session', 500, err);
  }
};

// @desc    Update session with Conflict Detection
// @route   PUT /api/sessions/:id
// @access  Private (Organizer, Admin, Speaker)
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      sendError(res, 'Session not found', 404);
      return;
    }

    const {
      title,
      description,
      room,
      date,
      startTime,
      endTime,
      capacity,
      category,
      speaker,
    } = req.body;

    const targetRoom = room ? room.trim() : session.room;
    const targetDate = date ? new Date(date) : session.date;
    const targetStartTime = startTime || session.startTime;
    const targetEndTime = endTime || session.endTime;

    // Check for conflicts if room, date, or time is being updated
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setHours(23, 59, 59, 999));

    const existingSessions = await Session.find({
      _id: { $ne: session._id },
      event: session.event,
      room: { $regex: new RegExp(`^${targetRoom}$`, 'i') },
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    for (const existing of existingSessions) {
      if (checkTimeOverlap(targetStartTime, targetEndTime, existing.startTime, existing.endTime)) {
        res.status(409).json({
          success: false,
          conflict: true,
          message: 'Session conflict: Another session is already scheduled in this room during this time.',
          conflictingSession: {
            title: existing.title,
            room: existing.room,
            startTime: existing.startTime,
            endTime: existing.endTime,
          },
        });
        return;
      }
    }

    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (room) session.room = targetRoom;
    if (date) session.date = targetDate;
    if (startTime) session.startTime = targetStartTime;
    if (endTime) session.endTime = targetEndTime;
    if (capacity) session.capacity = Number(capacity);
    if (category) session.category = category;
    if (speaker !== undefined) session.speaker = speaker || undefined;

    await session.save();
    sendSuccess(res, session, 'Session updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update session', 500, err);
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Organizer, Admin)
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      sendError(res, 'Session not found', 404);
      return;
    }

    await Event.findByIdAndUpdate(session.event, {
      $pull: { sessions: session._id },
    });

    await session.deleteOne();
    sendSuccess(res, null, 'Session deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete session', 500, err);
  }
};

// @desc    Attendee toggle Add to My Schedule (with attendee conflict prevention)
// @route   POST /api/sessions/:id/schedule
// @access  Private (Attendee)
export const toggleAttendeeSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      sendError(res, 'Session not found', 404);
      return;
    }

    const userId = req.user!._id;
    const isAttending = session.attendees.some((attId) => attId.toString() === userId.toString());

    if (isAttending) {
      // Remove from schedule
      session.attendees = session.attendees.filter(
        (attId) => attId.toString() !== userId.toString()
      );
      await session.save();
      sendSuccess(res, { isScheduled: false }, 'Session removed from your schedule');
      return;
    }

    // Capacity limit check
    if (session.attendees.length >= session.capacity) {
      sendError(res, 'This session has reached its capacity limit', 400);
      return;
    }

    // Check if attendee is already scheduled for another session at the same time
    const startOfDay = new Date(new Date(session.date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(session.date).setHours(23, 59, 59, 999));

    const attendeeExistingSessions = await Session.find({
      _id: { $ne: session._id },
      event: session.event,
      attendees: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    for (const existing of attendeeExistingSessions) {
      if (checkTimeOverlap(session.startTime, session.endTime, existing.startTime, existing.endTime)) {
        res.status(409).json({
          success: false,
          message: `Schedule conflict: You are already attending '${existing.title}' at ${existing.startTime} - ${existing.endTime}`,
        });
        return;
      }
    }

    session.attendees.push(userId);
    await session.save();

    sendSuccess(res, { isScheduled: true }, 'Session added to your schedule');
  } catch (err: any) {
    sendError(res, 'Failed to update schedule', 500, err);
  }
};
