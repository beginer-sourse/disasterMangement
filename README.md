# Jalsaathi Dashboard

A comprehensive disaster reporting platform built with React, TypeScript, Node.js, Express, and MongoDB Atlas. This platform allows citizens to report disasters, view real-time reports, and provides analytics for emergency response teams.

## 🌟 Features

### Frontend (React + TypeScript)
- **Modern UI**: Beautiful, responsive design with dark/light theme support
- **User Authentication**: JWT-based login and registration
- **Real-time Dashboard**: Live disaster reports and analytics
- **Interactive Map**: Visual representation of disaster locations
- **Report Submission**: Easy-to-use form for disaster reporting with media upload
- **User Management**: Profile management and admin controls
- **Analytics**: Comprehensive charts and statistics
- **Real-time Notifications**: Instant updates for new reports and status changes
- **Admin Panel**: Dynamic report management with verification controls

### Backend (Node.js + Express + TypeScript)
- **RESTful API**: Well-structured API endpoints
- **JWT Authentication**: Secure user authentication and authorization
- **MongoDB Integration**: Scalable database with MongoDB Atlas
- **File Upload**: Cloudinary integration for media storage
- **Admin Panel**: Report verification and user management
- **Analytics API**: Real-time statistics and reporting
- **WebSocket Support**: Real-time updates and notifications
- **Security**: Rate limiting, CORS, input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for media uploads)
- Google Maps API key (for interactive maps)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd "Disaster Reporting Platform Design 2"
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Update MongoDB URI, JWT secret, and Cloudinary credentials

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install frontend dependencies
npm install

# Create environment file for Google Maps
# Create a .env file in the root directory and add:
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Start frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000

## 📁 Project Structure

```
Disaster Reporting Platform Design 2/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── package.json
│   └── README.md
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── styles/            # CSS styles
├── package.json
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=write_mongoDBConnection

# JWT Configuration
JWT_SECRET=disaster-alert-super-secret-jwt-key-2024
JWT_EXPIRE=7d

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Reports
- `GET /api/reports` - Get all reports (with pagination)
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/vote` - Vote on report

### Comments
- `GET /api/comments/report/:reportId` - Get comments
- `POST /api/comments/report/:reportId` - Create comment
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Analytics
- `GET /api/analytics` - Get comprehensive analytics (admin)
- `GET /api/analytics/severity` - Reports by severity
- `GET /api/analytics/location` - Reports by location
- `GET /api/analytics/user-activity` - User activity stats

### Admin
- `PUT /api/admin/reports/:id/verify` - Verify/reject report
- `GET /api/admin/reports/pending` - Get pending reports
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user

## 🗄️ Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (user/admin),
  avatar: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### DisasterReport Collection
```javascript
{
  title: String,
  description: String,
  disasterType: String,
  severity: String (LOW/MEDIUM/HIGH/CRITICAL),
  location: String,
  coordinates: { latitude: Number, longitude: Number },
  media: { url: String, type: String, publicId: String },
  status: String (PENDING/VERIFIED/REJECTED),
  author: ObjectId (User),
  authorName: String,
  authorAvatar: String,
  votes: { up: Number, down: Number, users: [ObjectId] },
  comments: [ObjectId],
  views: Number,
  verifiedBy: ObjectId (User),
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Collection
```javascript
{
  content: String,
  author: ObjectId (User),
  authorName: String,
  authorAvatar: String,
  report: ObjectId (DisasterReport),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 Real-time Features

### WebSocket Integration
- **Live Updates**: Real-time notifications for new reports
- **Admin Notifications**: Instant alerts for pending reports
- **Status Updates**: Live verification and rejection updates
- **Connection Management**: Auto-reconnection and error handling
- **Authentication**: JWT-based WebSocket authentication

### Admin Panel Enhancements
- **Dynamic Report List**: Automatically updates when new reports arrive
- **Verify/Reject Controls**: Enhanced buttons with loading states
- **Toast Notifications**: Visual feedback for all actions
- **Connection Status**: Live indicator showing WebSocket status
- **Real-time Stats**: Dashboard statistics update automatically

For detailed WebSocket setup and configuration, see [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md).

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Cross-origin request security
- **File Upload Validation**: Secure media upload handling
- **Role-based Access**: Admin and user permissions
- **WebSocket Security**: Authenticated real-time connections

## 🎨 UI Components

The frontend uses a modern component library with:
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **Sonner**: Toast notifications
- **Recharts**: Data visualization

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Vercel, AWS, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `dist` folder to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🗺️ Google Maps Integration

The platform now features interactive Google Maps with:
- Real-time disaster report markers
- Severity-based color coding (Critical: Red, High: Orange, Medium: Yellow, Low: Blue)
- Clickable markers with detailed information windows
- Automatic map centering and zoom to fit all markers
- Dark theme support for better visibility
- Built-in legend showing severity levels

### Setup Google Maps
1. Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create a `.env` file in the root directory
4. Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
5. See `GOOGLE_MAPS_SETUP.md` for detailed instructions

## 🔮 Future Enhancements

- Real-time notifications with WebSockets
- Mobile app development
- Advanced mapping features with clustering
- Machine learning for disaster prediction
- Integration with emergency services
- Multi-language support
- Advanced analytics dashboard

---

**Built with ❤️ for disaster preparedness and community safety**
