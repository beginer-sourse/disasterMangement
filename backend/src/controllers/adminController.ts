import { Request, Response } from 'express';
import DisasterReport from '../models/DisasterReport';
import User from '../models/User';
import Comment from '../models/Comment';
import { ApiResponse, PaginatedResponse, IUser } from '../types';
import { wsServer } from '../server';
import { NotificationService } from '../utils/notificationService';

export const verifyReport = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }
    const adminId = req.user._id.toString();

    const report = await DisasterReport.findById(id);
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be VERIFIED or REJECTED'
      } as ApiResponse);
      return;
    }

    // Update report status
    report.status = status;
    report.verifiedBy = adminId;
    report.verifiedAt = new Date();

    await report.save();

    // Award credits to user if report is verified
    if (status === 'VERIFIED') {
      const user = await User.findById(report.author);
      if (user) {
        // Award credits based on severity
        let creditsToAward = 0;
        switch (report.severity) {
          case 'LOW':
            creditsToAward = 5;
            break;
          case 'MEDIUM':
            creditsToAward = 10;
            break;
          case 'HIGH':
            creditsToAward = 20;
            break;
          case 'CRITICAL':
            creditsToAward = 50;
            break;
          default:
            creditsToAward = 5;
        }

        user.credits += creditsToAward;
        user.verifiedReportsCount += 1;
        await user.save();
      }
    }

    // Create notification for report author
    await NotificationService.createReportVerificationNotification(
      id,
      report.author,
      adminId,
      status as 'VERIFIED' | 'REJECTED'
    );

    // Populate the report with author details for WebSocket broadcast
    const populatedReport = await DisasterReport.findById(id)
      .populate('author', 'name email avatar');

    // Broadcast report verification to all clients
    if (wsServer) {
      wsServer.broadcastReportVerification(id, status, req.user?.name || 'Admin');
      wsServer.broadcastReportUpdate(populatedReport);
    }

    res.status(200).json({
      success: true,
      message: `Report ${status.toLowerCase()} successfully`,
      data: { report: populatedReport }
    } as ApiResponse);
  } catch (error) {
    console.error('Verify report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'credits';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find()
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as PaginatedResponse<any>);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const updateUserRole = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      } as ApiResponse);
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    } as ApiResponse);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getPendingReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reports = await DisasterReport.find({ status: 'PENDING' })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DisasterReport.countDocuments({ status: 'PENDING' });

    res.status(200).json({
      success: true,
      message: 'Pending reports retrieved successfully',
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as PaginatedResponse<any>);
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getAllReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const severity = req.query.severity as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build filter object
    const filter: any = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await DisasterReport.find(filter)
      .populate('author', 'name email avatar')
      .populate('verifiedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await DisasterReport.countDocuments(filter);

    // Get statistics
    const stats = await DisasterReport.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } }
        }
      }
    ]);

    const adminStats = stats[0] || {
      total: 0,
      critical: 0,
      pending: 0,
      verified: 0,
      rejected: 0
    };

    res.status(200).json({
      success: true,
      message: 'All reports retrieved successfully',
      data: reports,
      stats: adminStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as PaginatedResponse<any>);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const makeUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      } as ApiResponse);
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated to admin successfully',
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } }
    } as ApiResponse);
  } catch (error) {
    console.error('Make user admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const deleteUser = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Prevent admin from deleting themselves
      if (userId === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      } as ApiResponse);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    // Delete user's reports and comments
    await DisasterReport.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const blockUser = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    // Prevent admin from blocking themselves
    if (userId === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'Cannot block your own account'
      } as ApiResponse);
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: { user }
    } as ApiResponse);
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const unblockUser = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: { user }
    } as ApiResponse);
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
