# Admin APIs Documentation

## Overview

Admin APIs handle all operations related to system administrators including signup, authentication, and logout functionality.

## Base URL
```
/api
```

## Authentication

Most admin endpoints require authentication. Include the JWT token in the request header:

```
token: <jwt_token>
```

## Endpoints

### 1. Admin Signup

**POST** `/api/signup-admin`

Create a new admin account.

#### Request

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 characters)",
  "role": "string (optional) - enum: [admin, superadmin]",
  "image": "file (optional) - profile image"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
      "adminData": {
        "_id": "admin_id",
        "name": "Admin Name",
        "email": "admin@example.com",
        "image": "image_url",
        "role": "admin",
        "isActive": true
      },
  "token": "jwt_token"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Name is required"
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "Admin with this email already exists"
}
```

---

### 2. Admin Login

**POST** `/api/login-admin`

Authenticate an admin and return JWT token.

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
      "adminData": {
        "_id": "admin_id",
        "name": "Admin Name",
        "email": "admin@example.com",
        "image": "image_url",
        "role": "admin",
        "isActive": true
      },
  "token": "jwt_token"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Admin not found"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Admin account is deactivated. Please contact superadmin."
}
```

---

### 3. Admin Logout

**POST** `/api/logout-admin`

Logout admin (client-side token removal confirmation).

#### Headers (Optional)
```
token: <jwt_token> (optional - not required for logout)
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

**Note:** Since JWT is stateless, logout is typically handled client-side by removing the token. This endpoint provides a confirmation response. Authentication is not required - the endpoint will work even without a token or with an expired/invalid token.

---

### 4. Get Admin Data

**GET** `/api/admin-data`

Get authenticated admin's profile data.

#### Headers

**Option 1: Using `token` header (Recommended)**
```
token: <jwt_token>
```

**Option 2: Using `Authorization` header with Bearer**
```
Authorization: Bearer <jwt_token>
```

**Option 3: Using `Authorization` header without Bearer**
```
Authorization: <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Admin data fetched successfully",
  "adminData": {
    "_id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Admin not found"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Admin account deactivated |
| 404 | Not Found - Admin not found |
| 409 | Conflict - Admin already exists |
| 500 | Internal Server Error - Server error |

## Troubleshooting

If you're experiencing authentication issues, see the [Admin Authentication Troubleshooting Guide](./troubleshooting-admin-auth.md) for detailed solutions.

## Admin Roles

### Role Types

- **admin** - Standard administrator (default)
- **superadmin** - Super administrator with elevated privileges

### Role Usage

The role field can be used to implement role-based access control (RBAC) in your application. You can extend the middleware to check for specific roles before allowing access to certain endpoints.

---

## Security Features

### 1. Password Security
- Passwords are hashed using bcrypt (10 salt rounds)
- Minimum password length: 6 characters
- Passwords are never returned in API responses

### 2. Account Status
- Admin accounts can be activated/deactivated
- Deactivated admins cannot login
- `isActive` field controls account access

### 3. Token Security
- JWT tokens expire after 30 days
- Tokens are verified on each protected request
- Invalid or expired tokens return 401 Unauthorized

---

## Notes

1. **No Email Verification**: Admin accounts don't require email verification (unlike users and companies)
2. **Profile Image**: Profile image is optional during signup
3. **Stateless Logout**: Logout is handled client-side by removing the token
4. **Account Status**: Admins can be deactivated without deleting their account
5. **Role Management**: Role field allows for future RBAC implementation
6. **File Upload**: Profile images are uploaded to the server using multipart/form-data

---

## Example Usage

### Complete Admin Flow

1. **Signup Admin**
```bash
curl -X POST http://localhost:5000/api/signup-admin \
  -F "name=Admin User" \
  -F "email=admin@example.com" \
  -F "password=admin123" \
  -F "role=admin" \
  -F "image=@profile.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "adminData": {
    "_id": "admin_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

2. **Login Admin**
```bash
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
  "adminData": {
    "_id": "admin_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

3. **Get Admin Data**
```bash
# Using token header (recommended)
curl -X GET http://localhost:5000/api/admin-data \
  -H "token: your_jwt_token"

# Or using Authorization header
curl -X GET http://localhost:5000/api/admin-data \
  -H "Authorization: Bearer your_jwt_token"
```

4. **Logout Admin** (Token optional)
```bash
# With token (optional)
curl -X POST http://localhost:5000/api/logout-admin \
  -H "token: your_jwt_token"

# Without token (also works)
curl -X POST http://localhost:5000/api/logout-admin
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

---

## JavaScript/Fetch Examples

### Signup Admin
```javascript
const signupAdmin = async (adminData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('name', adminData.name);
    formData.append('email', adminData.email);
    formData.append('password', adminData.password);
    if (adminData.role) formData.append('role', adminData.role);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch('http://localhost:5000/api/signup-admin', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage or state
      localStorage.setItem('adminToken', data.token);
      console.log('Admin created:', data.adminData);
      return data;
    } else {
      console.error('Signup failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
const imageFile = document.querySelector('input[type="file"]').files[0];
signupAdmin({
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
}, imageFile);
```

### Login Admin
```javascript
const loginAdmin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/login-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token
      localStorage.setItem('adminToken', data.token);
      console.log('Login successful:', data.adminData);
      return data;
    } else {
      console.error('Login failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Get Admin Data
```javascript
const getAdminData = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No token found. Please login first.');
    }
    
    const response = await fetch('http://localhost:5000/api/admin-data', {
      method: 'GET',
      headers: {
        'token': token,
        // Alternative: 'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Admin data:', data.adminData);
      return data.adminData;
    } else {
      console.error('Failed to fetch admin data:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Logout Admin
```javascript
const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    // Token is optional for logout
    const headers = {};
    if (token) {
      headers['token'] = token;
    }
    
    const response = await fetch('http://localhost:5000/api/logout-admin', {
      method: 'POST',
      headers: headers,
    });

    const data = await response.json();
    
    if (data.success) {
      // Remove token from storage
      localStorage.removeItem('adminToken');
      console.log('Logout successful');
      return data;
    } else {
      console.error('Logout failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## React Example

```jsx
import React, { useState } from 'react';

const AdminAuth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [image, setImage] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      if (image) formData.append('image', image);

      const response = await fetch('http://localhost:5000/api/signup-admin', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setAdminData(data.adminData);
        localStorage.setItem('adminToken', data.token);
        alert('Signup successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/login-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setAdminData(data.adminData);
        localStorage.setItem('adminToken', data.token);
        alert('Login successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout-admin', {
        method: 'POST',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setToken(null);
        setAdminData(null);
        localStorage.removeItem('adminToken');
        alert('Logout successful!');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      {!token ? (
        <div>
          <form onSubmit={handleSignup}>
            <h2>Admin Signup</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <button type="submit">Signup</button>
          </form>

          <form onSubmit={handleLogin}>
            <h2>Admin Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Welcome, {adminData?.name}</h2>
          {adminData?.image && (
            <img src={adminData.image} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%' }} />
          )}
          <p>Email: {adminData?.email}</p>
          <p>Role: {adminData?.role}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
```

---

## Database Schema

### Admin Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  image: String (optional, default: ""),
  role: String (default: "admin", enum: ["admin", "superadmin"]),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Future Enhancements

Potential features to add:

1. **Password Reset** - Forgot password functionality
2. **Change Password** - Update admin password
3. **Update Profile** - Update admin name and email
4. **Role-Based Access Control** - Implement RBAC for different admin roles
5. **Admin Management** - CRUD operations for admin accounts (superadmin only)
6. **Activity Logging** - Track admin actions
7. **Session Management** - Token refresh and session tracking
