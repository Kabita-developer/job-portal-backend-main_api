# Data Models Documentation

## Overview

This document describes all the data models used in the Job Portal Backend API. The models are defined using Mongoose schemas and represent the core entities of the system.

## Table of Contents

- [User Model](#user-model)
- [Company Model](#company-model)
- [Job Model](#job-model)
- [JobApplication Model](#jobapplication-model)
- [Category Model](#category-model)
- [Admin Model](#admin-model)
- [Database Relationships](#database-relationships)
- [Schema Validation](#schema-validation)

---

## User Model

Represents job seekers in the system.

### Schema Definition

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: "" },
  otp: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otpExpires: { type: Date }
}
```

### Properties

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `name` | String | ✅ | ❌ | - | User's full name |
| `email` | String | ✅ | ✅ | - | User's email address |
| `password` | String | ✅ | ❌ | - | Hashed password |
| `image` | String | ✅ | ❌ | - | Profile image URL |
| `resume` | String | ❌ | ❌ | `""` | Resume file URL |
| `otp` | String | ❌ | ❌ | - | OTP for email verification |
| `isEmailVerified` | Boolean | ❌ | ❌ | `false` | Email verification status |
| `otpExpires` | Date | ❌ | ❌ | - | OTP expiration timestamp |

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2b$10$hashedpassword...",
  "image": "https://cloudinary.com/image/upload/v1234567890/profile.jpg",
  "resume": "https://cloudinary.com/image/upload/v1234567890/resume.pdf",
  "otp": "123456",
  "isEmailVerified": true,
  "otpExpires": "2024-01-01T10:10:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Company Model

Represents employers in the system.

### Schema Definition

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  otp: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otpExpires: { type: Date }
}
```

### Properties

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `name` | String | ✅ | ❌ | - | Company name |
| `email` | String | ✅ | ✅ | - | Company email address |
| `password` | String | ✅ | ❌ | - | Hashed password |
| `image` | String | ✅ | ❌ | - | Company logo URL |
| `otp` | String | ❌ | ❌ | - | OTP for email verification |
| `isEmailVerified` | Boolean | ❌ | ❌ | `false` | Email verification status |
| `otpExpires` | Date | ❌ | ❌ | - | OTP expiration timestamp |

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Tech Corp",
  "email": "hr@techcorp.com",
  "password": "$2b$10$hashedpassword...",
  "image": "https://cloudinary.com/image/upload/v1234567890/logo.png",
  "otp": "654321",
  "isEmailVerified": true,
  "otpExpires": "2024-01-01T10:10:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Job Model

Represents job postings in the system.

### Schema Definition

```javascript
{
  title: { type: String, required: true },
  location: {
    city: { type: String, required: [true, "City is required"], trim: true },
    state: { type: String, required: [true, "State is required"], trim: true },
    country: { type: String, required: [true, "Country is required"], trim: true },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, "Invalid 6-digit pincode"] }
  },
  description: { type: String, required: true },
  salaryMin: { type: Number, min: [0, "Salary cannot be negative"], default: null },
  salaryMax: {
    type: Number,
    min: [0, "Salary cannot be negative"],
    default: null,
    validate: {
      validator: function (value) { 
        return !this.salaryMin || !value || value >= this.salaryMin; 
      },
      message: "Salary max must be greater than or equal to salary min"
    }
  },
  jobType: { 
    type: String, 
    required: [true, "Job type is required"], 
    enum: ["full-time", "part-time", "contract", "internship", "temporary"], 
    default: "full-time" 
  },
  experienceLevel: { 
    type: String, 
    enum: ["entry", "mid", "senior", "executive"], 
    default: "entry" 
  },
  skills: [{ type: String, trim: true, maxlength: 50 }],
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: [true, "Category is required"] 
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  employmentType: { 
    type: String, 
    enum: ["permanent", "contract", "freelance"], 
    default: "permanent" 
  },
  remoteOption: { 
    type: String, 
    enum: ["remote", "hybrid", "on-site"], 
    default: "on-site" 
  },
  visible: { type: Boolean, default: true }
}
```

### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ | Job title |
| `location` | Object | ✅ | Job location details |
| `location.city` | String | ✅ | City name |
| `location.state` | String | ✅ | State/Province |
| `location.country` | String | ✅ | Country |
| `location.pincode` | String | ❌ | 6-digit postal code |
| `description` | String | ✅ | Job description |
| `salaryMin` | Number | ❌ | Minimum salary |
| `salaryMax` | Number | ❌ | Maximum salary |
| `jobType` | String | ✅ | Type of job (enum) |
| `experienceLevel` | String | ❌ | Experience level (enum) |
| `skills` | Array | ❌ | Required skills |
| `category` | ObjectId | ✅ | Reference to Category |
| `companyId` | ObjectId | ✅ | Reference to Company |
| `employmentType` | String | ❌ | Employment type (enum) |
| `remoteOption` | String | ❌ | Remote work option (enum) |
| `visible` | Boolean | ❌ | Job visibility |

### Enums

#### Job Type
- `full-time` - Full-time employment
- `part-time` - Part-time employment
- `contract` - Contract-based work
- `internship` - Internship position
- `temporary` - Temporary position

#### Experience Level
- `entry` - Entry level (0-2 years)
- `mid` - Mid level (2-5 years)
- `senior` - Senior level (5+ years)
- `executive` - Executive level (10+ years)

#### Employment Type
- `permanent` - Permanent employment
- `contract` - Contract employment
- `freelance` - Freelance work

#### Remote Option
- `remote` - Fully remote work
- `hybrid` - Hybrid (mix of remote and office)
- `on-site` - On-site work only

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Senior Software Engineer",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "pincode": "94102"
  },
  "description": "We are looking for a senior software engineer to join our team...",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "jobType": "full-time",
  "experienceLevel": "senior",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
  "category": "507f1f77bcf86cd799439015",
  "companyId": "507f1f77bcf86cd799439012",
  "employmentType": "permanent",
  "remoteOption": "hybrid",
  "visible": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## JobApplication Model

Represents job applications in the system.

### Schema Definition

```javascript
{
  userId: { type: String, ref: "User", required: true },
  companyId: { type: mongoose.Types.ObjectId, required: true, ref: "Company" },
  jobId: { type: mongoose.Types.ObjectId, required: true, ref: "Job" },
  status: { 
    type: String, 
    default: "Pending", 
    enum: ["Pending", "Accepted", "Shortlisted", "Rejected"]
  },
  date: { type: Number, required: true }
}
```

### Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | String | ✅ | Reference to User (job seeker) |
| `companyId` | ObjectId | ✅ | Reference to Company |
| `jobId` | ObjectId | ✅ | Reference to Job |
| `status` | String | ❌ | Application status (enum) |
| `date` | Number | ✅ | Application timestamp |

### Status Enum
- `Pending` - Application pending review
- `Accepted` - Application accepted
- `Shortlisted` - Application shortlisted
- `Rejected` - Application rejected

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "companyId": "507f1f77bcf86cd799439012",
  "jobId": "507f1f77bcf86cd799439013",
  "status": "Pending",
  "date": 1704067200000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Category Model

Represents job categories in the system.

### Schema Definition

```javascript
{
  type: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}
```

### Properties

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `type` | String | ✅ | ✅ | - | Category name |
| `usageCount` | Number | ❌ | ❌ | `0` | Number of jobs using this category |
| `isVisible` | Boolean | ❌ | ❌ | `true` | Category visibility |

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "type": "Technology",
  "usageCount": 25,
  "isVisible": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Admin Model

Represents system administrators in the system.

### Schema Definition

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  role: { type: String, default: "admin", enum: ["admin", "superadmin"] },
  isActive: { type: Boolean, default: true }
}
```

### Properties

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `name` | String | ✅ | ❌ | - | Admin's full name |
| `email` | String | ✅ | ✅ | - | Admin's email address |
| `password` | String | ✅ | ❌ | - | Hashed password |
| `image` | String | ❌ | ❌ | `""` | Profile image URL |
| `role` | String | ❌ | ❌ | `"admin"` | Admin role (admin, superadmin) |
| `isActive` | Boolean | ❌ | ❌ | `true` | Account activation status |

### Role Enum
- `admin` - Standard administrator (default)
- `superadmin` - Super administrator with elevated privileges

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2b$10$hashedpassword...",
  "image": "uploads/profile/admin_image.jpg",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Notes

1. **No Email Verification**: Admin accounts don't require email verification
2. **Profile Image**: Profile image is optional (can be uploaded during signup)
3. **Account Status**: Admins can be deactivated without deletion
4. **Role-Based Access**: Role field enables role-based access control (RBAC)

---

## Database Relationships

### Entity Relationship Diagram

```
User (1) ──────── (N) JobApplication (N) ──────── (1) Job (N) ──────── (1) Company
                                                      │
                                                      │
                                                      │
                                                 (N) Category
```

### Relationship Details

1. **User ↔ JobApplication**
   - One-to-Many relationship
   - A user can have multiple job applications
   - A job application belongs to one user

2. **Company ↔ Job**
   - One-to-Many relationship
   - A company can post multiple jobs
   - A job belongs to one company

3. **Job ↔ JobApplication**
   - One-to-Many relationship
   - A job can have multiple applications
   - A job application belongs to one job

4. **Company ↔ JobApplication**
   - One-to-Many relationship
   - A company can receive multiple applications
   - A job application belongs to one company

5. **Category ↔ Job**
   - One-to-Many relationship
   - A category can have multiple jobs
   - A job belongs to one category

### Reference Fields

| Model | Reference Field | Referenced Model | Description |
|-------|-----------------|------------------|-------------|
| JobApplication | `userId` | User | Job seeker who applied |
| JobApplication | `companyId` | Company | Company that posted the job |
| JobApplication | `jobId` | Job | Job that was applied for |
| Job | `companyId` | Company | Company that posted the job |
| Job | `category` | Category | Job category |

---

## Schema Validation

### Built-in Validators

1. **Required Fields**
   - Fields marked as `required: true` must be provided
   - Custom error messages can be specified

2. **Unique Fields**
   - Fields marked as `unique: true` must be unique across the collection
   - Applies to email fields in User and Company models

3. **Enum Validation**
   - Fields with `enum` property must match one of the specified values
   - Used for jobType, experienceLevel, employmentType, remoteOption, status

4. **Number Validation**
   - `min` and `max` validators for numeric fields
   - Custom validation for salary ranges

5. **String Validation**
   - `trim` to remove whitespace
   - `maxlength` for maximum string length
   - `match` for regex pattern validation (pincode)

### Custom Validators

1. **Salary Range Validation**
   ```javascript
   validate: {
     validator: function (value) { 
       return !this.salaryMin || !value || value >= this.salaryMin; 
     },
     message: "Salary max must be greater than or equal to salary min"
   }
   ```

2. **Pincode Validation**
   ```javascript
   match: [/^\d{6}$/, "Invalid 6-digit pincode"]
   ```

### Validation Examples

#### Valid Job Document
```json
{
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
  "skills": ["JavaScript", "React"],
  "category": "507f1f77bcf86cd799439015",
  "companyId": "507f1f77bcf86cd799439012"
}
```

#### Invalid Job Document (Validation Errors)
```json
{
  "title": "", // Error: Required field
  "location": {
    "city": "New York",
    "state": "NY"
    // Error: Missing required country field
  },
  "salaryMin": 80000,
  "salaryMax": 50000, // Error: Max salary less than min salary
  "jobType": "invalid-type", // Error: Not in enum
  "pincode": "12345" // Error: Invalid pincode format
}
```

---

## Indexes

### Recommended Indexes

1. **User Model**
   ```javascript
   { email: 1 } // Unique index
   { isEmailVerified: 1 } // For filtering verified users
   ```

2. **Company Model**
   ```javascript
   { email: 1 } // Unique index
   { isEmailVerified: 1 } // For filtering verified companies
   ```

3. **Job Model**
   ```javascript
   { companyId: 1 } // For company's jobs
   { category: 1 } // For category filtering
   { visible: 1 } // For public job listings
   { jobType: 1, experienceLevel: 1 } // Compound index for filtering
   { "location.city": 1, "location.state": 1 } // For location-based searches
   ```

4. **JobApplication Model**
   ```javascript
   { userId: 1 } // For user's applications
   { companyId: 1 } // For company's applications
   { jobId: 1 } // For job's applications
   { status: 1 } // For status filtering
   { userId: 1, jobId: 1 } // Compound index for duplicate prevention
   ```

5. **Category Model**
   ```javascript
   { type: 1 } // Unique index
   { isVisible: 1 } // For filtering visible categories
   ```

---

## Data Types

### MongoDB Data Types Used

| Type | Description | Example |
|------|-------------|---------|
| `String` | Text data | "John Doe", "Software Engineer" |
| `Number` | Numeric data | 50000, 1704067200000 |
| `Boolean` | True/false values | true, false |
| `Date` | Date and time | "2024-01-01T00:00:00.000Z" |
| `ObjectId` | MongoDB document ID | "507f1f77bcf86cd799439011" |
| `Array` | List of values | ["JavaScript", "React", "Node.js"] |
| `Object` | Nested document | { city: "New York", state: "NY" } |

### Timestamps

All models include automatic timestamps:
- `createdAt` - Document creation time
- `updatedAt` - Document last update time

These are managed by Mongoose automatically when `{ timestamps: true }` is set in the schema options.

---

## Best Practices

### Data Integrity

1. **Use References**: Use ObjectId references instead of embedding documents
2. **Validate Input**: Always validate data before saving
3. **Handle Errors**: Implement proper error handling for validation failures
4. **Use Transactions**: For operations that affect multiple documents

### Performance

1. **Create Indexes**: Create appropriate indexes for frequently queried fields
2. **Limit Fields**: Use projection to limit returned fields
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: Consider caching frequently accessed data

### Security

1. **Password Hashing**: Always hash passwords before storing
2. **Input Sanitization**: Sanitize user inputs
3. **Access Control**: Implement proper access control
4. **Data Validation**: Validate all incoming data

### Example: Secure User Creation

```javascript
const createUser = async (userData) => {
  try {
    // Validate input
    const { name, email, password, image } = userData;
    
    if (!name || !email || !password || !image) {
      throw new Error('All fields are required');
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      image,
      isEmailVerified: false
    });
    
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};
```
