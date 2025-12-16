import mongoose, { Schema } from 'mongoose';
import { IDisasterReport } from '../types';

const disasterReportSchema = new Schema<IDisasterReport>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  disasterType: {
    type: String,
    required: [true, 'Disaster type is required'],
    enum: [
      'Flood', 'Cyclone', 'Tsunami', 'Oil Spill', 'Coastal Erosion',
      'High Waves', 'Storm Surge', 'Water Pollution', 'Marine Debris', 'Other'
    ]
  },
  severity: {
    type: String,
    required: [true, 'Severity level is required'],
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  media: {
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    publicId: {
      type: String,
      default: ''
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
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
  votes: {
    up: {
      type: Number,
      default: 0
    },
    down: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  comments: [{
    type: String,
    ref: 'Comment'
  }],
  views: {
    type: Number,
    default: 0
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
disasterReportSchema.index({ createdAt: -1 });
disasterReportSchema.index({ author: 1 });
disasterReportSchema.index({ status: 1 });
disasterReportSchema.index({ severity: 1 });
disasterReportSchema.index({ location: 1 });
disasterReportSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

export default mongoose.model<IDisasterReport>('DisasterReport', disasterReportSchema);
