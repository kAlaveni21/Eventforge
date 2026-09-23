import { Response } from 'express';
import Venue from '../models/Venue.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
export const getVenues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const venues = await Venue.find().sort({ name: 1 });
    sendSuccess(res, venues, 'Venues retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch venues', 500, err);
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Public
export const getVenueById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      sendError(res, 'Venue not found', 404);
      return;
    }
    sendSuccess(res, venue, 'Venue retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch venue', 500, err);
  }
};

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (Organizer, Admin)
export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, address, capacity, rooms, facilities, availability, contactPerson } = req.body;

    if (!name || !location || !address || !capacity) {
      sendError(res, 'Please provide venue name, location, address, and capacity', 400);
      return;
    }

    const venue = await Venue.create({
      name,
      location,
      address,
      capacity: Number(capacity),
      rooms: rooms || [{ name: 'Main Auditorium', capacity: Number(capacity), floor: 'Ground Floor' }],
      facilities: facilities || ['High-speed Wi-Fi', 'Audio/Visual Setup', 'Stage Lighting', 'Live Streaming'],
      availability: availability !== undefined ? availability : true,
      contactPerson: contactPerson || {},
      createdBy: req.user?._id,
    });

    sendSuccess(res, venue, 'Venue created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create venue', 500, err);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Organizer, Admin)
export const updateVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue) {
      sendError(res, 'Venue not found', 404);
      return;
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, venue, 'Venue updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update venue', 500, err);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Admin, Organizer)
export const deleteVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      sendError(res, 'Venue not found', 404);
      return;
    }

    await venue.deleteOne();
    sendSuccess(res, null, 'Venue deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete venue', 500, err);
  }
};
