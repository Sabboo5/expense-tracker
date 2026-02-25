import { Request, Response } from 'express';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendCreated, sendError, sendUnauthorized } from '../utils/apiResponse';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { config } from '../config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  maxAge: config.jwt.refreshExpiresInMs,
  path: '/',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, currency } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password, currency });

  const tokenPayload = { id: user._id.toString(), email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await RefreshToken.create({ token: refreshToken, user: user._id });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  sendCreated(res, {
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
  }, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenPayload = { id: user._id.toString(), email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await RefreshToken.create({ token: refreshToken, user: user._id });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
  }, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  const storedToken = await RefreshToken.findOne({ token });
  if (!storedToken) {
    res.clearCookie('refreshToken');
    throw new AppError('Invalid or expired refresh token', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    await RefreshToken.deleteOne({ token });
    res.clearCookie('refreshToken');
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    await RefreshToken.deleteOne({ token });
    res.clearCookie('refreshToken');
    throw new AppError('User not found', 401);
  }

  // Rotate refresh token
  await RefreshToken.deleteOne({ token });
  const tokenPayload = { id: user._id.toString(), email: user.email, name: user.name };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);
  await RefreshToken.create({ token: newRefreshToken, user: user._id });

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
});

export const logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await RefreshToken.deleteMany({ user: req.user!.id });
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out from all devices');
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  sendSuccess(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }, 'User fetched successfully');
});
