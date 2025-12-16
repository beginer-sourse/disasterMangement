const API_BASE_URL = 'http://localhost:5000/api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  credits: number;
  verifiedReportsCount: number;
  token?: string;
}

export interface DisasterReport {
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
  author: string;
  authorName: string;
  authorAvatar?: string;
  votes: {
    up: number;
    down: number;
    users: string[];
  };
  comments: Comment[];
  views: number;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  report: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  type: 'REPORT_VERIFIED' | 'REPORT_REJECTED' | 'REPORT_LIKED' | 'REPORT_DISLIKED' | 'COMMENT_ADDED' | 'REPORT_COMMENTED';
  title: string;
  message: string;
  relatedReport?: {
    _id: string;
    title: string;
  };
  relatedComment?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

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

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateProfile: async (token: string, userData: { name?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    severity?: string;
    status?: string;
    state?: string;
    t?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/reports?${queryParams}`);
    return response.json();
  },

  getReportById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`);
    return response.json();
  },

  createReport: async (token: string, reportData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: reportData,
    });
    
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    
    const result = await response.json();
    console.log('API Response data:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  },

  updateReport: async (token: string, id: string, reportData: Partial<DisasterReport>) => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });
    return response.json();
  },

  deleteReport: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  voteReport: async (token: string, id: string, voteType: 'up' | 'down') => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    });
    return response.json();
  },

  getUserReports: async (token: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/reports/user/my-reports?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (reportId: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/comments/report/${reportId}?${queryParams}`);
    return response.json();
  },

  createComment: async (token: string, reportId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/comments/report/${reportId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  updateComment: async (token: string, commentId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  deleteComment: async (token: string, commentId: string) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getReportsBySeverity: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/analytics/severity`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getReportsByLocation: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/analytics/location`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getUserActivity: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/analytics/user-activity`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getWaterAnalytics: async (token: string, timeRange: string = '7d') => {
    const response = await fetch(`${API_BASE_URL}/analytics/water?timeRange=${timeRange}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return response.json();
  },

  getRealTimeStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/realtime`);
    return response.json();
  },
};

// Admin API
export const adminAPI = {
  getAllReports: async (token: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    severity?: string;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/reports?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  verifyReport: async (token: string, reportId: string, status: 'VERIFIED' | 'REJECTED') => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  getPendingReports: async (token: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/reports/pending?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getAllUsers: async (token: string, params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: string; 
    sortOrder?: string; 
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateUserRole: async (token: string, userId: string, role: 'user' | 'admin') => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  deleteUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  blockUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  unblockUser: async (token: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unblock`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (token: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getUnreadCount: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  markAsRead: async (token: string, notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  markAllAsRead: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteNotification: async (token: string, notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
