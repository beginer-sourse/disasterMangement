# Jalsaathi Backend API

A comprehensive backend API for the Jalsaathi Dashboard built with Node.js, Express, TypeScript, and MongoDB Atlas.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Disaster Reports**: Create, read, update, delete disaster reports with media upload
- **User Interactions**: Like, dislike, and comment on reports
- **Analytics**: Comprehensive analytics for reports, users, and activity
- **Admin Panel**: Admin-only features for report verification and user management
- **Media Upload**: Cloudinary integration for image and video uploads
- **Security**: Rate limiting, CORS, helmet, and input validation

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=MONGODB_URI_REQUIRED_FROM_ENV

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

### 3. Cloudinary Setup (Optional)

For media uploads, you'll need to set up a Cloudinary account:

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your cloud name, API key, and API secret from the dashboard
4. Update the `.env` file with your Cloudinary credentials

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Reports
- `GET /api/reports` - Get all reports (with pagination and filters)
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report (protected)
- `PUT /api/reports/:id` - Update report (protected)
- `DELETE /api/reports/:id` - Delete report (protected)
- `POST /api/reports/:id/vote` - Vote on report (protected)

### Comments
- `GET /api/comments/report/:reportId` - Get comments for a report
- `POST /api/comments/report/:reportId` - Create comment (protected)
- `PUT /api/comments/:commentId` - Update comment (protected)
- `DELETE /api/comments/:commentId` - Delete comment (protected)

### Analytics
- `GET /api/analytics` - Get comprehensive analytics (admin only)
- `GET /api/analytics/severity` - Get reports by severity
- `GET /api/analytics/location` - Get reports by location
- `GET /api/analytics/user-activity` - Get user activity stats

### Admin
- `PUT /api/admin/reports/:id/verify` - Verify/reject report (admin only)
- `GET /api/admin/reports/pending` - Get pending reports (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:userId/role` - Update user role (admin only)
- `DELETE /api/admin/users/:userId` - Delete user (admin only)

## Database Schema

### User
- name, email, password, phone, role, avatar, isVerified

### DisasterReport
- title, description, disasterType, severity, location, coordinates, media, status, author, votes, comments, views, verifiedBy, verifiedAt

### Comment
- content, author, report, createdAt, updatedAt

## Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- File upload validation and size limits

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": string (optional)
}
```

## Development

- TypeScript for type safety
- ESLint for code quality
- Nodemon for development hot reload
- Comprehensive error handling
- Detailed logging
