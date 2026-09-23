import { Response } from 'express';
import Announcement from '../models/Announcement.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get announcements (can filter by event or audience)
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.event) {
      query.event = req.query.event;
    }
    if (req.query.targetAudience) {
      query.$or = [
        { targetAudience: 'All Attendees' },
        { targetAudience: req.query.targetAudience },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('event', 'title startDate')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    sendSuccess(res, announcements, 'Announcements retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch announcements', 500, err);
  }
};

// @desc    Create announcement & broadcast via Socket.IO
// @route   POST /api/announcements
// @access  Private (Organizer, Admin)
export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { event, title, message, targetAudience } = req.body;

    if (!event || !title || !message) {
      sendError(res, 'Please provide event, title, and message', 400);
      return;
    }

    const announcement = await Announcement.create({
      event,
      title,
      message,
      targetAudience: targetAudience || 'All Attendees',
      createdBy: req.user?._id,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('event', 'title')
      .populate('createdBy', 'name role');

    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_announcement', {
        announcement: populated,
        timestamp: new Date(),
      });
      // Also emit to event-specific room
      io.to(`event_${event}`).emit('event_announcement', populated);
    }

    sendSuccess(res, populated, 'Announcement broadcast successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to broadcast announcement', 500, err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Organizer, Admin)
export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      sendError(res, 'Announcement not found', 404);
      return;
    }

    await announcement.deleteOne();
    sendSuccess(res, null, 'Announcement deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete announcement', 500, err);
  }
};
