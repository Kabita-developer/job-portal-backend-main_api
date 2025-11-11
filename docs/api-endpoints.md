# API Endpoints Summary

## Overview

This document provides a comprehensive list of all API endpoints in the Job Portal Backend system, organized by functionality and user type.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
token: <jwt_token>
```

---

## User Endpoints

### Base Path: `/api`

| Method | Endpoint | Description | Auth Required | Content-Type |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/register-user` | Register new user | ❌ | multipart/form-data |
| POST | `/api/login-user` | User login | ❌ | application/json |
| POST | `/api/verify-otp` | Verify email OTP | ❌ | application/json |
| GET | `/api/user-data` | Get user profile | ✅ | - |
| POST | `/api/update-profile` | Update user profile | ✅ | multipart/form-data |
| POST | `/api/change-password` | Change password | ✅ | application/json |
| POST | `/api/apply-job` | Apply for job | ✅ | application/json |
| POST | `/api/get-user-applications` | Get user's job applications | ✅ | - |
| POST | `/api/upload-resume` | Upload resume | ✅ | multipart/form-data |

---

## Company Endpoints

### Base Path: `/api`

| Method | Endpoint | Description | Auth Required | Content-Type |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/register-company` | Register new company | ❌ | multipart/form-data |
| POST | `/api/login-company` | Company login | ❌ | application/json |
| POST | `/api/verify-otp` | Verify email OTP | ❌ | application/json |
| GET | `/api/company-data` | Get company profile | ✅ | - |
| POST | `/api/update-profile` | Update company profile | ✅ | multipart/form-data |
| POST | `/api/change-password` | Change password | ✅ | application/json |
| POST | `/api/post-job` | Create job posting | ✅ | application/json |
| PUT | `/api/update-job` | Update job posting | ✅ | application/json |
| POST | `/api/delete-job` | Delete job posting | ✅ | application/json |
| GET | `/api/company/posted-jobs` | Get company's jobs | ✅ | - |
| POST | `/api/change-visiblity` | Toggle job visibility | ✅ | application/json |
| POST | `/api/view-applications` | Get job applications | ✅ | application/json |
| POST | `/api/change-status` | Update application status | ✅ | application/json |

---

## Job Endpoints

### Base Path: `/api`

| Method | Endpoint | Description | Auth Required | Content-Type |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/all-jobs` | Get all visible jobs | ❌ | - |

---

## Category Endpoints

### Base Path: `/api` (Company authentication required)

| Method | Endpoint | Description | Auth Required | Content-Type |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/create-category` | Create job category | ✅ | application/json |
| PUT | `/api/update-category` | Update category | ✅ | application/json |
| POST | `/api/delete-category` | Delete category | ✅ | application/json |
| GET | `/api/categories` | Get visible categories | ✅ | - |
| GET | `/api/getAllVisibleCategories` | Get all categories | ✅ | - |
| POST | `/api/category-by-id` | Get category by ID | ✅ | application/json |
| POST | `/api/toggle-visibility` | Toggle category visibility | ✅ | application/json |

---

## Admin Endpoints

### Base Path: `/api`

| Method | Endpoint | Description | Auth Required | Content-Type |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/signup-admin` | Register new admin | ❌ | multipart/form-data |
| POST | `/api/login-admin` | Admin login | ❌ | application/json |
| POST | `/api/logout-admin` | Admin logout | ❌ | - |
| GET | `/api/admin-data` | Get admin profile | ✅ | - |

---

## Mobile Endpoints

### User Mobile Routes: `/user` (Same as web)

### Company Mobile Routes: `/company` (Same as web)

---

## Endpoint Details

### User Registration
```
POST /user/register-user
Content-Type: multipart/form-data

Body:
- name: string (required)
- email: string (required)
- password: string (required)
- image: file (required)
```

### User Login
```
POST /user/login-user
Content-Type: application/json

Body:
{
  "email": "string",
  "password": "string"
}
```

### Email Verification
```
POST /user/verify-otp
Content-Type: application/json

Body:
{
  "email": "string",
  "otp": "string"
}
```

### Get User Data
```
GET /user/user-data
Headers: token: <jwt_token>
```

### Update User Profile
```
POST /user/update-profile
Headers: token: <jwt_token>
Content-Type: multipart/form-data

Body:
- name: string (optional)
- email: string (optional)
- image: file (optional)
```

### Change Password
```
POST /user/change-password
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Apply for Job
```
POST /user/apply-job
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "jobId": "string"
}
```

### Get User Applications
```
POST /user/get-user-applications
Headers: token: <jwt_token>
```

### Upload Resume
```
POST /user/upload-resume
Headers: token: <jwt_token>
Content-Type: multipart/form-data

Body:
- resume: file (required)
```

---

## Company Endpoints Details

### Company Registration
```
POST /company/register-company
Content-Type: multipart/form-data

Body:
- name: string (required)
- email: string (required)
- password: string (required)
- image: file (required)
```

### Company Login
```
POST /company/login-company
Content-Type: application/json

Body:
{
  "email": "string",
  "password": "string"
}
```

### Post Job
```
POST /company/post-job
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "title": "string",
  "location": {
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string"
  },
  "description": "string",
  "salaryMin": "number",
  "salaryMax": "number",
  "jobType": "string",
  "experienceLevel": "string",
  "skills": ["string"],
  "category": "string",
  "employmentType": "string",
  "remoteOption": "string"
}
```

### Update Job
```
PUT /company/update-job
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string",
  "title": "string",
  "location": { ... },
  "description": "string",
  "salaryMin": "number",
  "salaryMax": "number",
  "jobType": "string",
  "experienceLevel": "string",
  "skills": ["string"],
  "category": "string",
  "employmentType": "string",
  "remoteOption": "string",
  "visible": "boolean"
}
```

### Delete Job
```
POST /company/delete-job
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string"
}
```

### Get Company Jobs
```
GET /company/company/posted-jobs
Headers: token: <jwt_token>

Query Parameters:
- search: string (optional)
- category: string (optional)
- isVisible: boolean (optional)
- page: number (optional)
- limit: number (optional)
```

### Change Job Visibility
```
POST /company/change-visiblity
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string"
}
```

### View Applications
```
POST /company/view-applications
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "search": "string (optional)",
  "status": "string (optional)",
  "page": "number (optional)",
  "limit": "number (optional)"
}
```

### Change Application Status
```
POST /company/change-status
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string",
  "status": "string"
}
```

---

## Job Endpoints Details

### Get All Jobs
```
GET /job/all-jobs
```

---

## Category Endpoints Details

### Create Category
```
POST /company/create-category
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "type": "string"
}
```

### Update Category
```
PUT /company/update-category
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string",
  "type": "string",
  "isVisible": "boolean (optional)"
}
```

### Delete Category
```
POST /company/delete-category
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string"
}
```

### Get Categories
```
GET /company/categories
Headers: token: <jwt_token>
```

### Get All Visible Categories
```
GET /company/getAllVisibleCategories
Headers: token: <jwt_token>
```

### Get Category by ID
```
POST /company/category-by-id
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string"
}
```

### Toggle Category Visibility
```
POST /company/toggle-visibility
Headers: token: <jwt_token>
Content-Type: application/json

Body:
{
  "id": "string"
}
```

---

## Response Formats

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

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Authentication Requirements

### Public Endpoints (No Authentication)
- User registration
- User login
- Company registration
- Company login
- Email verification
- Get all jobs

### User Authentication Required
- Get user data
- Update user profile
- Change password
- Apply for job
- Get user applications
- Upload resume

### Company Authentication Required
- Get company data
- Update company profile
- Change password
- Post job
- Update job
- Delete job
- Get company jobs
- Change job visibility
- View applications
- Change application status
- All category management

### Admin Authentication Required
- Get admin data

**Note:** Logout endpoint does not require authentication - it works with or without a token.

---

## File Upload Endpoints

### User File Uploads
- Profile image (registration)
- Profile image (update)
- Resume upload

### Company File Uploads
- Company logo (registration)
- Company logo (update)

### Supported File Types
- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX

### File Size Limits
- Maximum file size: 50MB

---

## Pagination

### Endpoints with Pagination
- Get company jobs (`/company/company/posted-jobs`)
- View applications (`/company/view-applications`)

### Pagination Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Search and Filtering

### Search Endpoints
- Get company jobs (search in title, skills, location)
- View applications (search in job title, location, user name)

### Filter Endpoints
- Get company jobs (filter by category, visibility)
- View applications (filter by status)

### Search Parameters
- `search`: General search term
- `category`: Filter by category ID
- `status`: Filter by application status
- `isVisible`: Filter by job visibility

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## CORS Configuration

CORS is enabled for all origins. Configure appropriately for production.

---

## Environment Variables

Required environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false

# App
PORT=5000
APP_URL=http://localhost:5000
```

---

## Testing Endpoints

### Health Check
```
GET /check
```

### Static Files
```
GET /uploads/<filename>
```

---

## Notes

1. **Authentication**: Most endpoints require JWT token in headers
2. **File Uploads**: Use multipart/form-data for file uploads
3. **Validation**: All inputs are validated before processing
4. **Error Handling**: Consistent error response format
5. **Security**: Passwords are hashed, tokens are signed
6. **Email Verification**: Required for all user registrations
7. **File Storage**: Files are stored locally (consider Cloudinary for production)
8. **Database**: MongoDB with Mongoose ODM
9. **Framework**: Express.js with ES6 modules
10. **Deployment**: Vercel configuration included
