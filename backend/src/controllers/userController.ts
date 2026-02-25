import { Response } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, currency } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { ...(name && { name }), ...(currency && { currency }) },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    avatar: user.avatar,
  }, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password changed successfully');
});

export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { password } = req.body;

  const user = await User.findById(req.user!.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Password is incorrect', 400);
  }

  // Delete all user data
  const { Transaction } = await import('../models/Transaction');
  const { RefreshToken } = await import('../models/RefreshToken');

  await Promise.all([
    Transaction.deleteMany({ user: user._id }),
    RefreshToken.deleteMany({ user: user._id }),
    User.findByIdAndDelete(user._id),
  ]);

  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Account deleted successfully');
});
