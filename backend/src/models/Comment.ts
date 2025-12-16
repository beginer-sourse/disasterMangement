import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  author: {
    type: String,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorAvatar: {
    type: String,
    default: ''
  },
  report: {
    type: String,
    ref: 'DisasterReport',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
commentSchema.index({ report: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);
