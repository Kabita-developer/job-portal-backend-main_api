# Admin Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Unauthorized. Please login again."

**Possible Causes:**

1. **Token not sent in request**
   - Make sure you're including the token in the request headers
   - Check if the token is stored correctly in your client

2. **Token sent in wrong header format**
   - The API accepts tokens in multiple formats (see below)

3. **Invalid or expired token**
   - Token might be expired (30 days validity)
   - Token might be corrupted or invalid

4. **Admin account doesn't exist**
   - The admin ID in the token doesn't match any admin in the database

5. **Admin account is deactivated**
   - The admin account has `isActive: false`

---

## How to Send Token

### Method 1: Using `token` Header (Recommended)

```bash
curl -X GET http://localhost:5000/api/admin-data \
  -H "token: your_jwt_token_here"
```

**JavaScript:**
```javascript
fetch('http://localhost:5000/api/admin-data', {
  method: 'GET',
  headers: {
    'token': localStorage.getItem('adminToken')
  }
});
```

### Method 2: Using `Authorization` Header with Bearer

```bash
curl -X GET http://localhost:5000/api/admin-data \
  -H "Authorization: Bearer your_jwt_token_here"
```

**JavaScript:**
```javascript
fetch('http://localhost:5000/api/admin-data', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
});
```

### Method 3: Using `Authorization` Header without Bearer

```bash
curl -X GET http://localhost:5000/api/admin-data \
  -H "Authorization: your_jwt_token_here"
```

---

## Debugging Steps

### Step 1: Verify Token Format

Check if your token is a valid JWT format:
- Should have 3 parts separated by dots: `header.payload.signature`
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1...`

### Step 2: Decode Token (for debugging)

You can decode the token payload (without verification) to check its contents:

**Online Tool:** https://jwt.io

Or in Node.js:
```javascript
const jwt = require('jsonwebtoken');
const token = 'your_token_here';
const decoded = jwt.decode(token);
console.log('Decoded token:', decoded);
```

The decoded token should have:
```json
{
  "id": "admin_id_here",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Step 3: Verify Admin Exists

Check if the admin exists in the database:

```javascript
// In MongoDB shell or using Mongoose
db.admins.findOne({ _id: ObjectId("admin_id_from_token") });
```

### Step 4: Check Admin Status

Verify the admin account is active:

```javascript
// In MongoDB shell
db.admins.findOne({ _id: ObjectId("admin_id_from_token") }, { isActive: 1 });
```

Should return: `{ "isActive": true }`

### Step 5: Verify JWT_SECRET

Make sure `JWT_SECRET` is set in your `.env` file:

```env
JWT_SECRET=your_secret_key_here
```

The same secret must be used for:
- Token generation (during login)
- Token verification (in middleware)

---

## Testing the API

### Test 1: Login and Get Token

```bash
# Login first
curl -X POST http://localhost:5000/api/login-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "adminData": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 2: Use Token to Get Admin Data

```bash
# Copy the token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use token to get admin data
curl -X GET http://localhost:5000/api/admin-data \
  -H "token: $TOKEN"
```

---

## Common Error Messages

### "Unauthorized. Token is required. Please login again."
- **Cause:** Token not sent in request
- **Solution:** Include token in headers

### "Invalid token. Please login again."
- **Cause:** Token is malformed or signed with different secret
- **Solution:** Login again to get a new token

### "Token expired. Please login again."
- **Cause:** Token has expired (30 days)
- **Solution:** Login again to get a new token

### "Admin not found"
- **Cause:** Admin ID in token doesn't exist in database
- **Solution:** 
  - Verify admin exists
  - Login again with valid admin account

### "Admin account is deactivated"
- **Cause:** Admin account has `isActive: false`
- **Solution:** Contact superadmin to activate account

### "Server configuration error"
- **Cause:** `JWT_SECRET` not set in environment variables
- **Solution:** Add `JWT_SECRET` to `.env` file

---

## Example: Complete Flow

### 1. Signup Admin
```bash
curl -X POST http://localhost:5000/api/signup-admin \
  -F "name=Admin User" \
  -F "email=admin@example.com" \
  -F "password=admin123" \
  -F "role=admin"
```

### 2. Login Admin
```bash
curl -X POST http://localhost:5000/api/login-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Save the token from response**

### 3. Get Admin Data
```bash
curl -X GET http://localhost:5000/api/admin-data \
  -H "token: YOUR_TOKEN_HERE"
```

---

## Browser/Postman Testing

### Postman Setup

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/login-admin`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "admin123"
     }
     ```

2. **Get Admin Data Request:**
   - Method: GET
   - URL: `http://localhost:5000/api/admin-data`
   - Headers:
     - Key: `token`
     - Value: `(paste token from login response)`

### Browser Console Testing

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/login-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
console.log('Login response:', loginData);

// 2. Save token
const token = loginData.token;
localStorage.setItem('adminToken', token);

// 3. Get admin data
const adminResponse = await fetch('http://localhost:5000/api/admin-data', {
  method: 'GET',
  headers: {
    'token': token
  }
});

const adminData = await adminResponse.json();
console.log('Admin data:', adminData);
```

---

## Still Having Issues?

1. **Check Server Logs:**
   - Look for error messages in console
   - Check for "JWT_SECRET is not set" errors

2. **Verify Environment Variables:**
   ```bash
   # Check if JWT_SECRET is loaded
   node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');"
   ```

3. **Test Token Manually:**
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = 'your_token_here';
   try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     console.log('Token is valid:', decoded);
   } catch (error) {
     console.error('Token error:', error.message);
   }
   ```

4. **Check Database Connection:**
   - Ensure MongoDB is running
   - Verify admin collection exists
   - Check if admin document exists

5. **Compare with Working Endpoints:**
   - Test user/company endpoints to see if they work
   - Compare token format and usage
