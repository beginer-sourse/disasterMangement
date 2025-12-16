import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  lastLoginAt?: Date;
  credits: number;
  verifiedReportsCount: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

// Disaster Report Types
export interface IDisasterReport extends Document {
  _id: string;
  title: string;
  description: string;
  disasterType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  media?: {
    url: string;
    type: 'image' | 'video';
    publicId: string;
  };
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  author: string; // User ID
  authorName: string;
  authorAvatar?: string;
  votes: {
    up: number;
    down: number;
    users: string[]; // Array of user IDs who voted
  };
  comments: IComment[];
  views: number;
  verifiedBy?: string; // Admin ID who verified
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportInput {
  title: string;
  description: string;
  disasterType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  media?: File;
}

// Comment Types
export interface IComment extends Document {
  _id: string;
  content: string;
  author: string; // User ID
  authorName: string;
  authorAvatar?: string;
  report: string; // Report ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentInput {
  content: string;
  reportId: string;
}

// Notification Types
export interface INotification extends Document {
  _id: string;
  recipient: string; // User ID who receives the notification
  sender?: string; // User ID who triggered the notification
  type: 'REPORT_VERIFIED' | 'REPORT_REJECTED' | 'REPORT_LIKED' | 'REPORT_DISLIKED' | 'COMMENT_ADDED' | 'REPORT_COMMENTED';
  title: string;
  message: string;
  relatedReport?: string; // Report ID
  relatedComment?: string; // Comment ID
  isRead: boolean;
  readAt?: Date;
  metadata?: any; // Additional data
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface IAnalytics {
  reportsBySeverity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  reportsByLocation: Array<{
    location: string;
    count: number;
  }>;
  userActivity: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisWeek: number;
  };
  reportsStats: {
    totalReports: number;
    verifiedReports: number;
    pendingReports: number;
    rejectedReports: number;
  };
  recentActivity: Array<{
    type: 'report' | 'comment' | 'verification';
    description: string;
    timestamp: Date;
    user?: string;
  }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Request with User
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
