# User APIs Documentation

## Overview

User APIs handle all operations related to job seekers including registration, authentication, profile management, and job applications.

## Base URL
```
/api
```

## Authentication

Most user endpoints require authentication. Include the JWT token in the request header:

```
token: <jwt_token>
```

## Endpoints

### 1. User Registration

**POST** `/api/register-user`

Register a new user account.

#### Request

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "password": "string (required)",
  "image": "file (required)",
  "resume": "file (required)",
  "date-of-birth": "string (required)",
  "gender": "string (required)",
  "location": {
    "latitude": "number (required)",
    "longitude": "number (required)"
  },
  "address": {
    "streetAddress": "string (required)",
    "country": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "pincode": "string (required)"
  },
  "relocation": "string (optional)",
  "relocationPlace": "string (optional)"
}
```

**Note:** `relocation` field accepts the following values:
- `"Yes, I'm willing to relocate"`
- `"Anywhere in India"`
- `"Only near..."` (when this option is selected, `relocationPlace` field should contain the desired place name)

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "userData": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "image_url"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Enter your name"
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### 2. User Login

**POST** `/api/login-user`

Authenticate a user and return JWT token.

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "userData": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "image_url",
    "isEmailVerified": true
  },
  "token": "jwt_token"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Email Not Verified (200):**
```json
{
  "success": false,
  "isEmailVerified": false,
  "message": "Email not verified. A new OTP has been sent to your email."
}
```

---

### 3. Verify OTP

**POST** `/api/verify-otp`

Verify user email with OTP code.

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "userData": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "image_url"
  },
  "token": "jwt_token"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 4. Get User Data

**GET** `/api/user-data`

Get authenticated user's profile data.

#### Headers
```
token: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "user data fetched successfully",
  "userData": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "image_url",
    "resume": "resume_url",
    "isEmailVerified": true
  }
}
```

---

### 5. Update Profile

**POST** `/api/update-profile`

Update user profile information.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "image": "file (optional)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "user details updated successfully"
}
```

---

### 6. Change Password

**POST** `/api/change-password`

Change user password.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "password changed successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## Job Applications

### 7. Apply for Job

**POST** `/api/apply-job`

Apply for a specific job posting.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "jobId": "string (required)"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Job applied successfully",
  "jobApplication": {
    "_id": "application_id",
    "jobId": "job_id",
    "userId": "user_id",
    "companyId": "company_id",
    "status": "Pending",
    "date": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "You have already applied for this job"
}
```

---

### 8. Get User Applied Jobs

**POST** `/api/get-user-applications`

Get all jobs applied by the authenticated user.

#### Headers
```
token: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Jobs application fetched successfully",
  "jobApplications": [
    {
      "_id": "application_id",
      "userId": "user_id",
      "companyId": {
        "_id": "company_id",
        "name": "Company Name",
        "email": "company@example.com",
        "image": "company_logo_url"
      },
      "jobId": {
        "_id": "job_id",
        "title": "Job Title",
        "location": {
          "city": "City",
          "state": "State",
          "country": "Country"
        },
        "date": "2024-01-01T00:00:00.000Z",
        "status": "active"
      },
      "status": "Pending",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 9. Upload Resume

**POST** `/api/upload-resume`

Upload user's resume document.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "resume": "file (required)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "resume_file_url"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Resume file is required"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - User or resource not found |
| 409 | Conflict - User already exists or already applied |
| 500 | Internal Server Error - Server error |

## Notes

1. **Email Verification**: All users must verify their email before they can log in
2. **File Uploads**: Profile images and resumes are uploaded to the server
3. **Authentication**: Most endpoints require a valid JWT token
4. **Password Security**: Passwords are hashed using bcrypt
5. **OTP Expiry**: OTP codes expire after 10 minutes
6. **Token Expiry**: JWT tokens expire after 30 days

## Example Usage

### Complete Registration Flow

1. **Register User**
```bash
curl -X POST http://localhost:5000/api/register-user \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "password=password123" \
  -F "image=@profile.jpg" \
  -F "resume=@resume.pdf" \
  -F "date-of-birth=1990-01-01" \
  -F "gender=Male" \
  -F "location[latitude]=40.7128" \
  -F "location[longitude]=-74.0060" \
  -F "address[streetAddress]=123 Main Street" \
  -F "address[country]=United States" \
  -F "address[city]=New York" \
  -F "address[state]=New York" \
  -F "address[pincode]=10001" \
  -F "relocation=Only near..." \
  -F "relocationPlace=Mumbai"
```

2. **Verify OTP**
```bash
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "otp": "123456"}'
```

3. **Login**
```bash
curl -X POST http://localhost:5000/api/login-user \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

4. **Apply for Job**
```bash
curl -X POST http://localhost:5000/api/apply-job \
  -H "Content-Type: application/json" \
  -H "token: your_jwt_token" \
  -d '{"jobId": "job_id_here"}'
```
