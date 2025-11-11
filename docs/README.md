# Job Portal Backend API Documentation

## Overview

This is a comprehensive REST API for a job portal system that supports both job seekers and employers. The API is built with Node.js, Express.js, and MongoDB.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [User APIs](#user-apis)
- [Company APIs](#company-apis)
- [Job APIs](#job-apis)
- [Category APIs](#category-apis)
- [Admin APIs](#admin-apis)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)
- [Environment Variables](#environment-variables)

## Getting Started

### Base URL
```
http://localhost:5000/api
```

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file uploads)
- SMTP server (for email verification)

### Installation
```bash
npm install
npm start
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are three types of authentication:

1. **User Authentication** - For job seekers
2. **Company Authentication** - For employers
3. **Admin Authentication** - For system administrators

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

Or using custom header:
```
token: <jwt_token>
```

## API Endpoints

### User APIs
- [User Registration & Authentication](./user-apis.md)
- [User Profile Management](./user-apis.md#profile-management)
- [Job Applications](./user-apis.md#job-applications)

### Company APIs
- [Company Registration & Authentication](./company-apis.md)
- [Company Profile Management](./company-apis.md#profile-management)
- [Job Management](./company-apis.md#job-management)
- [Application Management](./company-apis.md#application-management)

### Job APIs
- [Public Job Listings](./job-apis.md)

### Category APIs
- [Category Management](./category-apis.md)

### Admin APIs
- [Admin Authentication & Management](./admin-apis.md)

## Data Models

- [User Model](./data-models.md#user-model)
- [Company Model](./data-models.md#company-model)
- [Job Model](./data-models.md#job-model)
- [JobApplication Model](./data-models.md#jobapplication-model)
- [Category Model](./data-models.md#category-model)

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## File Uploads

The API supports file uploads for:
- User profile images
- Company logos
- User resumes

### Supported File Types
- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX

### File Size Limits
- Maximum file size: 50MB

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false

# App
PORT=5000
APP_URL=http://localhost:5000
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Tokens expire after 30 days
3. **Email Verification**: Required for all user registrations
4. **File Upload Security**: File type and size validation
5. **Input Validation**: All inputs are validated before processing

## Support

For API support and questions, please refer to the individual endpoint documentation or contact the development team.
