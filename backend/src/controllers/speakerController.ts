import { Response } from 'express';
import Speaker from '../models/Speaker.js';
import Session from '../models/Session.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all speakers
// @route   GET /api/speakers
// @access  Public
export const getSpeakers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.event) {
      query.events = req.query.event;
    }
    if (req.query.search) {
      const regex = new RegExp(req.query.search as string, 'i');
      query.$or = [{ name: regex }, { company: regex }, { designation: regex }, { expertise: regex }];
    }

    const speakers = await Speaker.find(query).sort({ name: 1 });
    sendSuccess(res, speakers, 'Speakers retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch speakers', 500, err);
  }
};

// @desc    Get single speaker
// @route   GET /api/speakers/:id
// @access  Public
export const getSpeakerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const speaker = await Speaker.findById(req.params.id).populate('events', 'title startDate endDate');
    if (!speaker) {
      sendError(res, 'Speaker not found', 404);
      return;
    }

    // Find sessions assigned to this speaker
    const sessions = await Session.find({ speaker: speaker._id }).populate('event', 'title startDate');

    sendSuccess(
      res,
      {
        ...speaker.toObject(),
        sessions,
      },
      'Speaker details retrieved'
    );
  } catch (err: any) {
    sendError(res, 'Failed to fetch speaker', 500, err);
  }
};

// @desc    Create a new speaker
// @route   POST /api/speakers
// @access  Private (Organizer, Admin, Speaker)
export const createSpeaker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      designation,
      company,
      bio,
      profileImage,
      expertise,
      socialLinks,
      availability,
      events,
      user,
    } = req.body;

    if (!name || !designation || !company) {
      sendError(res, 'Please provide name, designation, and company', 400);
      return;
    }

    const speaker = await Speaker.create({
      name,
      designation,
      company,
      bio: bio || '',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map((s: string) => s.trim()) : []),
      socialLinks: socialLinks || {},
      availability: availability || ['Day 1 Morning', 'Day 1 Afternoon', 'Day 2 Morning'],
      events: events || [],
      user: user || (req.user?.role === 'SPEAKER' ? req.user._id : undefined),
    });

    sendSuccess(res, speaker, 'Speaker created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create speaker', 500, err);
  }
};

// @desc    Update speaker (Organizer, Admin, or Speaker themselves)
// @route   PUT /api/speakers/:id
// @access  Private
export const updateSpeaker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      sendError(res, 'Speaker not found', 404);
      return;
    }

    // Check permissions: Admin, Organizer, or Speaker whose user ID matches
    const isOwner = speaker.user && req.user?._id.toString() === speaker.user.toString();
    const isPrivileged = req.user?.role === 'PLATFORM_ADMIN' || req.user?.role === 'EVENT_ORGANIZER';

    if (!isOwner && !isPrivileged) {
      sendError(res, 'Not authorized to edit this speaker profile', 403);
      return;
    }

    speaker = await Speaker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, speaker, 'Speaker profile updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update speaker', 500, err);
  }
};

// @desc    Delete speaker
// @route   DELETE /api/speakers/:id
// @access  Private (Organizer, Admin)
export const deleteSpeaker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      sendError(res, 'Speaker not found', 404);
      return;
    }

    await speaker.deleteOne();
    sendSuccess(res, null, 'Speaker deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete speaker', 500, err);
  }
};

// @desc    Upload presentation material for speaker
// @route   POST /api/speakers/:id/materials
// @access  Private (Speaker, Organizer, Admin)
export const uploadMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      sendError(res, 'Speaker not found', 404);
      return;
    }

    const { title, fileUrl } = req.body;
    if (!title || !fileUrl) {
      sendError(res, 'Please provide title and fileUrl', 400);
      return;
    }

    speaker.presentationMaterial.push({
      title,
      fileUrl,
      uploadedAt: new Date(),
    });

    await speaker.save();
    sendSuccess(res, speaker.presentationMaterial, 'Material uploaded successfully');
  } catch (err: any) {
    sendError(res, 'Failed to upload material', 500, err);
  }
};
