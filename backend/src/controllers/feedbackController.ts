import { Response } from 'express';
import Feedback from '../models/Feedback.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Attendee)
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { event, session, rating, comment } = req.body;
    const attendeeId = req.user?._id;

    if (!event || !rating) {
      sendError(res, 'Please provide event and rating (1-5)', 400);
      return;
    }

    if (rating < 1 || rating > 5) {
      sendError(res, 'Rating must be between 1 and 5 stars', 400);
      return;
    }

    // Prevent duplicate feedback for same session
    if (session) {
      const existing = await Feedback.findOne({
        session,
        attendee: attendeeId,
      });

      if (existing) {
        sendError(res, 'You have already submitted feedback for this session', 409);
        return;
      }
    }

    const feedback = await Feedback.create({
      event,
      session: session || undefined,
      attendee: attendeeId,
      rating: Number(rating),
      comment: comment || '',
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('attendee', 'name avatar company')
      .populate('session', 'title');

    sendSuccess(res, populated, 'Feedback submitted successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to submit feedback', 500, err);
  }
};

// @desc    Get feedback for an event
// @route   GET /api/feedback/event/:eventId
// @access  Public
export const getEventFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('attendee', 'name avatar company')
      .populate('session', 'title speaker room')
      .sort({ createdAt: -1 });

    const totalRatings = feedbacks.length;
    const averageRating = totalRatings > 0
      ? Number((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0;

    sendSuccess(
      res,
      {
        averageRating,
        totalRatings,
        feedbacks,
      },
      'Event feedback retrieved'
    );
  } catch (err: any) {
    sendError(res, 'Failed to fetch feedback', 500, err);
  }
};

// @desc    Get feedback for a specific session
// @route   GET /api/feedback/session/:sessionId
// @access  Public
export const getSessionFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const feedbacks = await Feedback.find({ session: sessionId })
      .populate('attendee', 'name avatar company')
      .sort({ createdAt: -1 });

    const totalRatings = feedbacks.length;
    const averageRating = totalRatings > 0
      ? Number((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : 0;

    sendSuccess(
      res,
      {
        averageRating,
        totalRatings,
        feedbacks,
      },
      'Session feedback retrieved'
    );
  } catch (err: any) {
    sendError(res, 'Failed to fetch session feedback', 500, err);
  }
};
