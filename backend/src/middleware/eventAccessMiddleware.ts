import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';
import Event from '../models/Event.js';

export const checkEventAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Platform Admin has full unrestricted access
    if (user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    const eventId = req.params.eventId || req.params.id || req.body.event || req.body.eventId;
    if (!eventId) {
      res.status(400).json({ success: false, message: 'Event ID is required for access check' });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Event Organizer check
    if (user.role === 'EVENT_ORGANIZER') {
      if (event.organizer.toString() !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You do not own or manage this event',
        });
        return;
      }
      return next();
    }

    // Event Staff check
    if (user.role === 'EVENT_STAFF') {
      const isAssigned = event.assignedStaff?.some(
        (staffId) => staffId.toString() === user._id.toString()
      );
      if (!isAssigned) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this event',
        });
        return;
      }
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied for this event',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying event permissions',
      error: err.message,
    });
  }
};
