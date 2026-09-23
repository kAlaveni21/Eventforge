import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, company, title, phone } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Please provide name, email, and password', 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'Email already in use', 400);
      return;
    }

    // Default role is ATTENDEE unless specified (PLATFORM_ADMIN creation can be restricted or initialized in seed)
    const assignedRole = role || 'ATTENDEE';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      company: company || '',
      title: title || '',
      phone: phone || '',
    });

    const token = generateToken(user._id.toString(), user.role);

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          title: user.title,
          phone: user.phone,
          avatar: user.avatar,
          isActive: user.isActive,
        },
      },
      'User registered successfully',
      201
    );
  } catch (err: any) {
    sendError(res, 'Registration failed', 500, err);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Please provide email and password', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Account deactivated. Please contact support.', 403);
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          title: user.title,
          phone: user.phone,
          avatar: user.avatar,
          isActive: user.isActive,
        },
      },
      'Logged in successfully'
    );
  } catch (err: any) {
    sendError(res, 'Login failed', 500, err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const user = await User.findById(req.user._id);
    sendSuccess(res, user, 'Current user profile retrieved');
  } catch (err: any) {
    sendError(res, 'Failed to fetch user profile', 500, err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(res, null, 'Logged out successfully');
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      // Return 200 for security so email enumeration is mitigated
      sendSuccess(res, null, 'If that email is registered, a password reset link has been dispatched');
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In a production setup, dispatch email here. In this system, return the reset token for demo testing
    sendSuccess(
      res,
      { resetToken },
      'Password reset token generated. Use this token with /api/auth/reset-password'
    );
  } catch (err: any) {
    sendError(res, 'Could not process password reset', 500, err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      sendError(res, 'Please provide reset token and new password', 400);
      return;
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      sendError(res, 'Invalid or expired password reset token', 400);
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id.toString(), user.role);

    sendSuccess(
      res,
      { token: jwtToken },
      'Password has been reset successfully'
    );
  } catch (err: any) {
    sendError(res, 'Password reset failed', 500, err);
  }
};
