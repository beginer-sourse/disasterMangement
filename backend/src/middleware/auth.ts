import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser, JWTPayload } from '../types';

export const authenticate = async (req: Request & { user?: IUser }, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== AUTHENTICATION CHECK ===');
    console.log('Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Extracted token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('No token provided');
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found');
      res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
      return;
    }

    req.user = user;
    console.log('Authentication successful');
    next();
  } catch (error) {
    console.log('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request & { user?: IUser }, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};
