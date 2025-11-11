import express from "express";
import {
  signupAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminData,
} from "../controllers/adminController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { uploader } from '../utils/files.js';

const router = express.Router();

// File upload middleware for profile image
const uploadProfile = uploader('profile').single('image');

// Public routes
router.post("/signup-admin", uploadProfile, signupAdmin);
router.post("/login-admin", loginAdmin);
router.post("/logout-admin", logoutAdmin); // No auth required - logout is client-side token removal

// Protected routes
router.get("/admin-data", adminAuthMiddleware, getAdminData);

export default router;
