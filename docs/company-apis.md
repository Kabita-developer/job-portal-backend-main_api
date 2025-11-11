# Company APIs Documentation

## Overview

Company APIs handle all operations related to employers including registration, authentication, profile management, job posting, and application management.

## Base URL
```
/api
```

## Authentication

All company endpoints require authentication. Include the JWT token in the request header:

```
token: <jwt_token>
```

## Endpoints

### 1. Company Registration

**POST** `/api/register-company`

Register a new company account.

#### Request

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "image": "file (required)"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "companyData": {
    "_id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "image": "logo_url"
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
  "message": "Company already exists"
}
```

---

### 2. Company Login

**POST** `/api/login-company`

Authenticate a company and return JWT token.

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
  "companyData": {
    "_id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "image": "logo_url",
    "isEmailVerified": true
  },
  "token": "jwt_token"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Company not found"
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

### 3. Verify Company OTP

**POST** `/api/verify-otp`

Verify company email with OTP code.

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
  "companyData": {
    "_id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "image": "logo_url"
  },
  "token": "jwt_token"
}
```

---

### 4. Get Company Data

**GET** `/api/company-data`

Get authenticated company's profile data.

#### Headers
```
token: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Company data fetched successfully",
  "companyData": {
    "_id": "company_id",
    "name": "Company Name",
    "email": "company@example.com",
    "image": "logo_url",
    "isEmailVerified": true
  }
}
```

---

### 5. Update Company Profile

**POST** `/api/update-profile`

Update company profile information.

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
  "message": "Company details updated successfully"
}
```

---

### 6. Change Company Password

**POST** `/api/change-password`

Change company password.

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

---

## Job Management

### 7. Post Job

**POST** `/api/post-job`

Create a new job posting.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "title": "string (required)",
  "location": {
    "city": "string (required)",
    "state": "string (required)",
    "country": "string (required)",
    "pincode": "string (optional)"
  },
  "description": "string (required)",
  "salaryMin": "number (optional)",
  "salaryMax": "number (optional)",
  "jobType": "string (required) - enum: [full-time, part-time, contract, internship, temporary]",
  "experienceLevel": "string (optional) - enum: [entry, mid, senior, executive]",
  "skills": ["string"] (optional),
  "category": "string (required) - category ID",
  "employmentType": "string (optional) - enum: [permanent, contract, freelance]",
  "remoteOption": "string (optional) - enum: [remote, hybrid, on-site]"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "jobData": {
    "_id": "job_id",
    "title": "Software Engineer",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "10001"
    },
    "description": "Job description here",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "jobType": "full-time",
    "experienceLevel": "mid",
    "skills": ["JavaScript", "React", "Node.js"],
    "category": "category_id",
    "companyId": "company_id",
    "employmentType": "permanent",
    "remoteOption": "hybrid",
    "visible": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 8. Update Job

**PUT** `/api/update-job`

Update an existing job posting.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - job ID",
  "title": "string (required)",
  "location": {
    "city": "string (required)",
    "state": "string (required)",
    "country": "string (required)",
    "pincode": "string (optional)"
  },
  "description": "string (required)",
  "salaryMin": "number (optional)",
  "salaryMax": "number (optional)",
  "jobType": "string (required)",
  "experienceLevel": "string (optional)",
  "skills": ["string"] (optional),
  "category": "string (required)",
  "employmentType": "string (optional)",
  "remoteOption": "string (optional)",
  "visible": "boolean (optional)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "jobData": {
    "_id": "job_id",
    "title": "Updated Job Title",
    "location": { ... },
    "description": "Updated description",
    "visible": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 9. Delete Job

**POST** `/api/delete-job`

Delete a job posting.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - job ID"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete job because it has existing applications"
}
```

---

### 10. Get Company Posted Jobs

**GET** `/api/company/posted-jobs`

Get all jobs posted by the authenticated company.

#### Headers
```
token: <jwt_token>
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in title, skills, location |
| `category` | string | Filter by category ID |
| `isVisible` | boolean | Filter by visibility |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "jobData": [
    {
      "_id": "job_id",
      "title": "Software Engineer",
      "location": { ... },
      "description": "Job description",
      "salaryMin": 50000,
      "salaryMax": 80000,
      "jobType": "full-time",
      "experienceLevel": "mid",
      "skills": ["JavaScript", "React"],
      "category": {
        "_id": "category_id",
        "type": "Technology"
      },
      "employmentType": "permanent",
      "remoteOption": "hybrid",
      "visible": true,
      "applicants": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 11. Change Job Visibility

**POST** `/api/change-visiblity`

Toggle job visibility (show/hide job).

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - job ID"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Visibility changed"
}
```

---

## Application Management

### 12. Get Company Job Applicants

**POST** `/api/view-applications`

Get all job applications for the company's jobs.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "search": "string (optional) - search in job title, location, or user name",
  "status": "string (optional) - filter by application status",
  "page": "number (optional) - page number",
  "limit": "number (optional) - items per page"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Applicants fetched successfully",
  "viewApplicationData": [
    {
      "_id": "application_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "image": "profile_image_url",
        "resume": "resume_url"
      },
      "jobId": {
        "_id": "job_id",
        "title": "Software Engineer",
        "location": {
          "city": "New York",
          "state": "NY",
          "country": "USA"
        },
        "date": "2024-01-01T00:00:00.000Z",
        "status": "active"
      },
      "status": "Pending",
      "date": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 13. Change Application Status

**POST** `/api/change-status`

Update the status of a job application.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - application ID",
  "status": "string (required) - enum: [Pending, Accepted, Shortlisted, Rejected]"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Status changed successfully",
  "application": {
    "_id": "application_id",
    "userId": "user_id",
    "companyId": "company_id",
    "jobId": "job_id",
    "status": "Shortlisted",
    "date": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Category Management

### 14. Create Category

**POST** `/api/create-category`

Create a new job category.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "type": "string (required) - category name"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "categoryData": {
    "_id": "category_id",
    "type": "Technology",
    "usageCount": 0,
    "isVisible": true
  }
}
```

---

### 15. Update Category

**PUT** `/api/update-category`

Update an existing category.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - category ID",
  "type": "string (required) - new category name",
  "isVisible": "boolean (optional)"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "categoryData": {
    "_id": "category_id",
    "type": "Updated Technology",
    "usageCount": 5,
    "isVisible": true
  }
}
```

---

### 16. Delete Category

**POST** `/api/delete-category`

Delete a category.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - category ID"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete category because it is used in existing jobs"
}
```

---

### 17. Get All Categories

**GET** `/api/categories`

Get all categories (visible only).

#### Headers
```
token: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "categories": [
    {
      "_id": "category_id",
      "type": "Technology",
      "usageCount": 10,
      "isVisible": true
    }
  ]
}
```

---

### 18. Get All Visible Categories

**GET** `/api/getAllVisibleCategories`

Get all categories including hidden ones.

#### Headers
```
token: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "categories": [
    {
      "_id": "category_id",
      "type": "Technology",
      "usageCount": 10,
      "isVisible": true
    },
    {
      "_id": "category_id_2",
      "type": "Marketing",
      "usageCount": 5,
      "isVisible": false
    }
  ]
}
```

---

### 19. Get Category by ID

**POST** `/api/category-by-id`

Get a specific category by ID.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - category ID"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Category fetched successfully",
  "category": {
    "_id": "category_id",
    "type": "Technology",
    "usageCount": 10,
    "isVisible": true
  }
}
```

---

### 20. Toggle Category Visibility

**POST** `/api/toggle-visibility`

Toggle category visibility.

#### Headers
```
token: <jwt_token>
```

#### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "id": "string (required) - category ID"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Category visibility enabled successfully",
  "categoryData": {
    "_id": "category_id",
    "type": "Technology",
    "usageCount": 10,
    "isVisible": true
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Unauthorized to perform action |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

## Notes

1. **Email Verification**: All companies must verify their email before they can log in
2. **Job Ownership**: Companies can only manage their own job postings
3. **Application Management**: Companies can view and manage applications for their jobs
4. **Category Management**: Companies can create and manage job categories
5. **File Uploads**: Company logos are uploaded to the server
6. **Pagination**: List endpoints support pagination with page and limit parameters
7. **Search**: Many endpoints support search functionality

## Example Usage

### Complete Company Registration Flow

1. **Register Company**
```bash
curl -X POST http://localhost:5000/api/register-company \
  -F "name=Tech Corp" \
  -F "email=hr@techcorp.com" \
  -F "password=password123" \
  -F "image=@logo.png"
```

2. **Verify OTP**
```bash
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "hr@techcorp.com", "otp": "123456"}'
```

3. **Post Job**
```bash
curl -X POST http://localhost:5000/api/post-job \
  -H "Content-Type: application/json" \
  -H "token: your_jwt_token" \
  -d '{
    "title": "Software Engineer",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "description": "We are looking for a skilled software engineer...",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "jobType": "full-time",
    "category": "category_id_here"
  }'
```

4. **View Applications**
```bash
curl -X POST http://localhost:5000/api/view-applications \
  -H "Content-Type: application/json" \
  -H "token: your_jwt_token" \
  -d '{"page": 1, "limit": 10}'
```
