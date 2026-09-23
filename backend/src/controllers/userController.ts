import { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

// @desc    Get all users (with search, filter, pagination)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { company: searchRegex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendPagination(res, users, total, page, limit, 'Users retrieved successfully');
  } catch (err: any) {
    sendError(res, 'Failed to fetch users', 500, err);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'User retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch user', 500, err);
  }
};

// @desc    Update user (Admin can update roles & active state; Users can update their profile)
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isSelf = req.user?._id.toString() === user._id.toString();
    const isAdmin = req.user?.role === 'PLATFORM_ADMIN';

    if (!isSelf && !isAdmin) {
      sendError(res, 'Not authorized to update this profile', 403);
      return;
    }

    const { name, phone, bio, company, title, avatar, role, isActive } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (company !== undefined) user.company = company;
    if (title !== undefined) user.title = title;
    if (avatar !== undefined) user.avatar = avatar;

    // Only platform admin can change role or active status
    if (isAdmin) {
      if (role) user.role = role;
      if (typeof isActive === 'boolean') user.isActive = isActive;
    }

    await user.save();
    sendSuccess(res, user, 'User updated successfully');
  } catch (err: any) {
    sendError(res, 'Failed to update user', 500, err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Prevent deleting own admin account
    if (req.user?._id.toString() === user._id.toString()) {
      sendError(res, 'Cannot delete your own admin account', 400);
      return;
    }

    await user.deleteOne();
    sendSuccess(res, null, 'User deleted successfully');
  } catch (err: any) {
    sendError(res, 'Failed to delete user', 500, err);
  }
};
