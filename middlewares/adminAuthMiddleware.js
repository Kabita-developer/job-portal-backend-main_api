import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Support multiple token formats
    let token = req.headers.token || req.headers['token'];
    
    // Also check Authorization header with Bearer token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Token is required. Please login again." 
      });
    }

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error" 
      });
    }

    // Verify and decode token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false,
          message: "Invalid token. Please login again." 
        });
      }
      
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false,
          message: "Token expired. Please login again." 
        });
      }

      return res.status(401).json({ 
        success: false,
        message: "Token verification failed. Please login again." 
      });
    }

    // Find admin by ID
    const admin = await Admin.findById(decodedToken.id).select("-password");

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Admin account is deactivated. Please contact superadmin." 
      });
    }

    req.adminData = admin;

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    
    // Handle specific error types
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }

    // Generic error
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized. Please login again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default adminAuthMiddleware;
