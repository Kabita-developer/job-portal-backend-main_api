# Quick Start Guide

## Overview

This guide will help you get the Job Portal Backend API up and running quickly.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd job-portal-backend-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_SECURE=false

# App
PORT=5000
APP_URL=http://localhost:5000
```

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:5000`

## Quick Test

### 1. Health Check
```bash
curl http://localhost:5000/check
```
Expected response: `api is working`

### 2. Register a User
```bash
curl -X POST http://localhost:5000/user/register-user \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "image=@profile.jpg"
```

### 3. Verify Email (Check your email for OTP)
```bash
curl -X POST http://localhost:5000/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "otp": "123456"}'
```

### 4. Login
```bash
curl -X POST http://localhost:5000/user/login-user \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### 5. Get All Jobs
```bash
curl http://localhost:5000/job/all-jobs
```

## API Documentation

- [Main Documentation](./README.md)
- [User APIs](./user-apis.md)
- [Company APIs](./company-apis.md)
- [Job APIs](./job-apis.md)
- [Data Models](./data-models.md)
- [Authentication](./authentication.md)
- [API Endpoints](./api-endpoints.md)

## Common Issues

### 1. Database Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

### 2. Email Not Sending
- Verify SMTP credentials
- Check email settings
- Ensure app-specific password for Gmail

### 3. File Upload Issues
- Check file size limits
- Verify file types
- Ensure uploads directory exists

### 4. Authentication Errors
- Verify JWT_SECRET is set
- Check token format in headers
- Ensure user is email verified

## Development

### Project Structure
```
├── controllers/     # Business logic
├── models/         # Database schemas
├── routes/         # API endpoints
├── middlewares/    # Authentication
├── utils/          # Helper functions
├── db/            # Database connection
└── docs/          # Documentation
```

### Key Files
- `server.js` - Main server file
- `package.json` - Dependencies and scripts
- `.env` - Environment variables
- `vercel.json` - Deployment configuration

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Manual Deployment
1. Install dependencies: `npm install`
2. Set environment variables
3. Start server: `npm start`

## Support

For issues and questions:
1. Check the documentation
2. Review error logs
3. Verify environment setup
4. Test with provided examples

## Next Steps

1. Set up frontend application
2. Configure production database
3. Set up email service
4. Implement file storage (Cloudinary)
5. Add monitoring and logging
6. Set up CI/CD pipeline
