import { Response } from 'express';
import Attendance from '../models/Attendance.js';
import Registration from '../models/Registration.js';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Check-in attendee by scanning QR code or Registration ID
// @route   POST /api/attendance/check-in
// @access  Private (Staff, Organizer, Admin)
export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { registrationId, qrData, eventId } = req.body;

    let targetRegId = registrationId;

    // If raw QR data was scanned, parse it
    if (!targetRegId && qrData) {
      try {
        const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        targetRegId = parsed.regId || parsed.registrationId;
      } catch (e) {
        targetRegId = qrData; // fallback if it was a plain string ID
      }
    }

    if (!targetRegId) {
      sendError(res, 'Please provide registrationId or QR scan payload', 400);
      return;
    }

    // Lookup registration
    const registration = await Registration.findOne({
      $or: [{ registrationId: targetRegId }, { _id: targetRegId.match(/^[0-9a-fA-F]{24}$/) ? targetRegId : null }],
    })
      .populate('attendee', 'name email company phone avatar')
      .populate('event', 'title startDate endDate venue')
      .populate('ticket', 'name price');

    if (!registration) {
      sendError(res, 'Invalid Registration QR code. Registration not found.', 404);
      return;
    }

    if (registration.status !== 'CONFIRMED' || registration.approvalStatus !== 'APPROVED') {
      sendError(res, `Cannot check-in. Registration status is ${registration.status} (${registration.approvalStatus}).`, 400);
      return;
    }

    // If eventId was passed by staff, ensure it matches the event
    if (eventId && registration.event._id.toString() !== eventId.toString()) {
      sendError(res, 'This registration belongs to a different event!', 400);
      return;
    }

    // Prevent duplicate check-in
    const existingAttendance = await Attendance.findOne({
      registration: registration._id,
      event: registration.event._id,
    });

    if (existingAttendance) {
      const attendeeName = (registration.attendee as any)?.name || 'Attendee';
      res.status(409).json({
        success: false,
        alreadyCheckedIn: true,
        message: `Attendee ${attendeeName} was already checked in at ${new Date(existingAttendance.checkInTime).toLocaleTimeString()}`,
        attendance: existingAttendance,
        registration,
      });
      return;
    }

    const attendeeId = (registration.attendee as any)?._id || registration.attendee;
    const attendeeName = (registration.attendee as any)?.name || 'Attendee';

    const attendance = await Attendance.create({
      event: (registration.event as any)._id || registration.event,
      attendee: attendeeId,
      registration: registration._id,
      checkInTime: new Date(),
      checkedInBy: req.user?._id,
      sessionsAttended: [],
    });

    sendSuccess(
      res,
      {
        attendance,
        registration,
      },
      `Check-in successful! Welcome, ${attendeeName}.`,
      201
    );
  } catch (err: any) {
    sendError(res, 'Check-in failed', 500, err);
  }
};

// @desc    Check-out attendee
// @route   POST /api/attendance/check-out
// @access  Private (Staff, Organizer, Admin)
export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attendanceId, registrationId } = req.body;

    let query: any = {};
    if (attendanceId) {
      query._id = attendanceId;
    } else if (registrationId) {
      const reg = await Registration.findOne({ registrationId });
      if (!reg) {
        sendError(res, 'Registration not found', 404);
        return;
      }
      query.registration = reg._id;
    } else {
      sendError(res, 'Please provide attendanceId or registrationId', 400);
      return;
    }

    const attendance = await Attendance.findOne(query)
      .populate('attendee', 'name email')
      .populate('event', 'title');

    if (!attendance) {
      sendError(res, 'Attendance record not found', 404);
      return;
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    sendSuccess(res, attendance, 'Attendee successfully checked out');
  } catch (err: any) {
    sendError(res, 'Check-out failed', 500, err);
  }
};

// @desc    Get attendance records for an event
// @route   GET /api/attendance/event/:eventId
// @access  Private (Staff, Organizer, Admin)
export const getEventAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const attendances = await Attendance.find({ event: eventId })
      .populate('attendee', 'name email company phone avatar')
      .populate({
        path: 'registration',
        populate: { path: 'ticket', select: 'name price' },
      })
      .populate('sessionsAttended.session', 'title startTime endTime room')
      .populate('checkedInBy', 'name role')
      .sort({ checkInTime: -1 });

    const totalCheckedIn = attendances.length;

    sendSuccess(
      res,
      {
        totalCheckedIn,
        records: attendances,
      },
      'Event attendance retrieved'
    );
  } catch (err: any) {
    sendError(res, 'Failed to fetch event attendance', 500, err);
  }
};

// @desc    Mark attendance for a specific session
// @route   POST /api/attendance/session
// @access  Private (Staff, Organizer, Admin)
export const markSessionAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, attendeeId, registrationId } = req.body;

    if (!sessionId || (!attendeeId && !registrationId)) {
      sendError(res, 'Please provide sessionId and either attendeeId or registrationId', 400);
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      sendError(res, 'Session not found', 404);
      return;
    }

    let targetAttendeeId = attendeeId;
    if (!targetAttendeeId && registrationId) {
      const reg = await Registration.findOne({ registrationId });
      if (reg) targetAttendeeId = reg.attendee;
    }

    // Find main event attendance record
    let attendance = await Attendance.findOne({
      event: session.event,
      attendee: targetAttendeeId,
    });

    if (!attendance) {
      // Create event attendance record automatically if attendee wasn't formally checked in at main gate
      const reg = await Registration.findOne({ event: session.event, attendee: targetAttendeeId });
      if (!reg) {
        sendError(res, 'Attendee is not registered for this event', 400);
        return;
      }

      attendance = await Attendance.create({
        event: session.event,
        attendee: targetAttendeeId,
        registration: reg._id,
        checkInTime: new Date(),
        checkedInBy: req.user?._id,
        sessionsAttended: [],
      });
    }

    // Check if session already recorded
    const alreadyAttended = attendance.sessionsAttended.some(
      (s) => s.session.toString() === sessionId.toString()
    );

    if (alreadyAttended) {
      res.status(409).json({
        success: false,
        message: 'Attendee has already been marked present for this session',
      });
      return;
    }

    attendance.sessionsAttended.push({
      session: session._id as any,
      attendedAt: new Date(),
    });

    await attendance.save();

    // Also add to session attendees if not already
    await Session.findByIdAndUpdate(sessionId, {
      $addToSet: { attendees: targetAttendeeId },
    });

    sendSuccess(res, attendance, 'Session attendance recorded successfully');
  } catch (err: any) {
    sendError(res, 'Failed to record session attendance', 500, err);
  }
};
