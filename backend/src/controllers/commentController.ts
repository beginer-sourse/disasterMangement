import { Request, Response } from 'express';
import Comment from '../models/Comment';
import DisasterReport from '../models/DisasterReport';
import { ICommentInput, ApiResponse, IUser } from '../types';
import { NotificationService } from '../utils/notificationService';

export const createComment = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const { reportId } = req.params;
    
    // Parse multilingual content if it's JSON strings
    let parsedContent: any = content;
    
    try {
      if (typeof content === 'string' && content.startsWith('{')) {
        parsedContent = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error parsing multilingual content:', error);
      // Fallback to original values if parsing fails
    }
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const userId = req.user._id.toString();
    const userName = req.user.name;
    const userAvatar = req.user.avatar;

    // Check if report exists
    const report = await DisasterReport.findById(reportId);
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    // Create new comment
    const comment = new Comment({
      content: parsedContent,
      author: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      report: reportId
    });

    await comment.save();

    // Add comment to report
    report.comments.push(comment._id as any);
    await report.save();

    // Create notification for report author
    await NotificationService.createCommentNotification(
      reportId,
      report.author,
      userId,
      userName,
      comment._id.toString()
    );

    // Populate the comment with author details
    await comment.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment }
    } as ApiResponse);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ report: reportId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ report: reportId });

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const updateComment = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const userId = req.user._id.toString();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      } as ApiResponse);
      return;
    }

    // Check if user can update this comment
    if (comment.author !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      } as ApiResponse);
      return;
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment: updatedComment }
    } as ApiResponse);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const deleteComment = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found'
      } as ApiResponse);
      return;
    }

    // Check if user can delete this comment
    if (comment.author !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      } as ApiResponse);
      return;
    }

    // Remove comment from report
    await DisasterReport.findByIdAndUpdate(
      comment.report,
      { $pull: { comments: commentId } }
    );

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
