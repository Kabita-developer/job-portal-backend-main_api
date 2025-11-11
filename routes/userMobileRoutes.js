import express from "express";
import {
  registerUser,
  loginUser,
  fetchUserData,
  applyJob,
  getUserAppliedJobs,
  uploadResume,
  verifyUserOTP,
  changePassword,
  updateProfile
} from "../controllers/userController.js";
import upload from "../utils/upload.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

import { uploader } from './../utils/files.js';
const router = express.Router();

const uploadProfile = uploader('profile').single('image');
router.post("/register-user", uploadProfile, registerUser);
router.post("/login-user", uploadProfile, loginUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/change-password", userAuthMiddleware, changePassword);
router.post("/update-profile", userAuthMiddleware, updateProfile);
router.get("/user-data", userAuthMiddleware, fetchUserData);
router.post("/apply-job", userAuthMiddleware, applyJob);
router.post("/get-user-applications", userAuthMiddleware, getUserAppliedJobs);
const uploadResumeDoc = uploader('resume').single('resume');
router.post(
  "/upload-resume",
  userAuthMiddleware,
  uploadResumeDoc,
  uploadResume
);

export default router;
