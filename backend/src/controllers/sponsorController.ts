import { Response } from 'express';
import Sponsor from '../models/Sponsor.js';
import SponsorshipPackage from '../models/SponsorshipPackage.js';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all sponsors (can filter by event)
// @route   GET /api/sponsors
// @access  Public
export const getSponsors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.event) {
      query.event = req.query.event;
    }

    const sponsors = await Sponsor.find(query)
      .populate('event', 'title startDate')
      .populate('user', 'name email')
      .sort({ package: 1, createdAt: -1 });

    sendSuccess(res, sponsors, 'Sponsors retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch sponsors', 500, err);
  }
};

// @desc    Get single sponsor
// @route   GET /api/sponsors/:id
// @access  Public
export const getSponsorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sponsor = await Sponsor.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email company avatar');

    if (!sponsor) {
      sendError(res, 'Sponsor not found', 404);
      return;
    }

    sendSuccess(res, sponsor, 'Sponsor details retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch sponsor', 500, err);
  }
};

// @desc    Create a new sponsor
// @route   POST /api/sponsors
// @access  Private (Organizer, Admin)
export const createSponsor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      logo,
      website,
      package: pkg,
      assignedDeliverables,
      paymentStatus,
      event,
      user,
    } = req.body;

    if (!companyName || !contactPerson || !email || !event) {
      sendError(res, 'Please provide company name, contact person, email, and event', 400);
      return;
    }

    const defaultDeliverables = [
      { title: 'Brand Logo on Main Stage & Banner', status: 'IN_PROGRESS' },
      { title: 'Virtual Exhibition Booth', status: 'PENDING' },
      { title: 'Keynote Introduction Mention', status: 'PENDING' },
      { title: 'Complimentary VIP Passes Dispatched', status: 'COMPLETED' },
    ];

    const sponsor = await Sponsor.create({
      companyName,
      contactPerson,
      email,
      phone: phone || '',
      logo: logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      website: website || '',
      package: pkg || 'Gold',
      assignedDeliverables: assignedDeliverables || defaultDeliverables,
      paymentStatus: paymentStatus || 'COMPLETED',
      event,
      user: user || (req.user?.role === 'SPONSOR' ? req.user._id : undefined),
    });

    // Link sponsor to event
    await Event.findByIdAndUpdate(event, {
      $addToSet: { sponsors: sponsor._id },
    });

    sendSuccess(res, sponsor, 'Sponsor created successfully', 201);
  } catch (err: any) {
    sendError(res, 'Failed to create sponsor', 500, err);
  }
};

// @desc    Update sponsor (Organizer, Admin, or Sponsor themselves)
// @route   PUT /api/sponsors/:id
// @access  Private
export const updateSponsor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      sendError(res, 'Sponsor not found', 404);
      return;
    }

    const isOwner = sponsor.user && req.user?._id.toString() === sponsor.user.toString();
    const isOrganizerOrAdmin = ['PLATFORM_ADMIN', 'EVENT_ORGANIZER'].includes(
      req.user?.role || ''
    );

    if (!isOwner && !isOrganizerOrAdmin) {
      sendError(res, 'Not authorized to update this sponsor', 403);
      return;
    }

    const {
      companyName,
      contactPerson,
      phone,
      logo,
      website,
      brandAssets,
      assignedDeliverables,
      package: pkg,
      paymentStatus,
    } = req.body;

    if (companyName) sponsor.companyName = companyName;
    if (contactPerson) sponsor.contactPerson = contactPerson;
    if (phone !== undefined) sponsor.phone = phone;
    if (logo !== undefined) sponsor.logo = logo;
    if (website !== undefined) sponsor.website = website;
    if (brandAssets) sponsor.brandAssets = brandAssets;
    if (assignedDeliverables) sponsor.assignedDeliverables = assignedDeliverables;

    // Only organizer/admin can modify package or paymentStatus
    if (isOrganizerOrAdmin) {
      if (pkg) sponsor.package = pkg;
      if (paymentStatus) sponsor.paymentStatus = paymentStatus;
    }

    await sponsor.save();
    sendSuccess(res, sponsor, 'Sponsor updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update sponsor', 500, err);
  }
};

// @desc    Delete sponsor
// @route   DELETE /api/sponsors/:id
// @access  Private (Organizer, Admin)
export const deleteSponsor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      sendError(res, 'Sponsor not found', 404);
      return;
    }

    await Event.findByIdAndUpdate(sponsor.event, {
      $pull: { sponsors: sponsor._id },
    });

    await sponsor.deleteOne();
    sendSuccess(res, null, 'Sponsor deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete sponsor', 500, err);
  }
};

// @desc    Get sponsorship package tiers
// @route   GET /api/sponsors/packages
// @access  Public
export const getPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const defaultPackages = [
      {
        name: 'Platinum',
        price: 15000,
        benefits: [
          'Premier Main Stage Branding',
          '20-minute Keynote Presentation Slot',
          'Premium Exhibition Booth Space (30x30)',
          '10 Complimentary VIP Passes',
          'Full-page feature in Conference Digital Guide',
          'Branded Lanyards & Badges distribution',
        ],
        maxSponsors: 2,
      },
      {
        name: 'Gold',
        price: 9000,
        benefits: [
          'Prominent Stage & Signage Logo Placement',
          'Exhibition Booth Space (20x20)',
          '6 Complimentary VIP Passes',
          'Logo featured on Website & Emails',
          'Session Sponsorship rights',
        ],
        maxSponsors: 4,
      },
      {
        name: 'Silver',
        price: 5000,
        benefits: [
          'Exhibition Booth Space (10x10)',
          '4 Complimentary Standard Passes',
          'Logo on Event Website & Digital App',
          'Mention in Welcome Address',
        ],
        maxSponsors: 8,
      },
      {
        name: 'Bronze',
        price: 2500,
        benefits: [
          'Tabletop Display space',
          '2 Complimentary Standard Passes',
          'Logo on Event Website',
        ],
        maxSponsors: 12,
      },
    ];

    sendSuccess(res, defaultPackages, 'Sponsorship packages retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch packages', 500, err);
  }
};
