import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: String,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ['REPORT_VERIFIED', 'REPORT_REJECTED', 'REPORT_LIKED', 'REPORT_DISLIKED', 'COMMENT_ADDED', 'REPORT_COMMENTED']
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  relatedReport: {
    type: String,
    ref: 'DisasterReport',
    required: false
  },
  relatedComment: {
    type: String,
    ref: 'Comment',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// Remove __v from JSON output
notificationSchema.set('toJSON', { 
  transform: function(doc, ret) {
    delete (ret as any).__v;
    return ret;
  }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
