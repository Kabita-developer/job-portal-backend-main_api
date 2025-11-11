import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

// Admin Signup
export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const imageFile = req?.file?.path || '';

    // Validation
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ 
        success: false, 
        message: "Admin with this email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      image: imageFile || "",
      role: role || "admin",
      isActive: true,
    });

    await admin.save();

    // Generate token
    const token = await generateToken(admin._id);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      adminData: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Admin signup failed",
      error: error.message,
    });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: "Admin account is deactivated. Please contact superadmin." 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate token
    const token = await generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      adminData: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Login failed",
      error: error.message,
    });
  }
};

// Admin Logout
export const logoutAdmin = async (req, res) => {
  try {
    // Since JWT is stateless, logout is typically handled client-side
    // by removing the token. This endpoint provides a confirmation.
    // No authentication required - logout works even without a valid token
    // as the client will remove the token from storage anyway.

    // Optionally verify token if provided (but don't require it)
    const token = req.headers.token;
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Token is valid - can log this for analytics if needed
        console.log(`Admin logout: ${decodedToken.id}`);
      } catch (tokenError) {
        // Token invalid or expired - that's okay for logout
        // Client should still remove the token
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful. Please remove the token from client storage.",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Get Admin Data
export const getAdminData = async (req, res) => {
  try {
    const admin = req.adminData;

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin data fetched successfully",
      adminData: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get admin data error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin data",
      error: error.message,
    });
  }
};
