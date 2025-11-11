import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  updateProfile,
  registerCompany,
  getCompanyPostedAllJobs,
  changeJobVisibility,
  getCompanyJobApplicants,
  changeStatus,
  updateJob,
  deleteJob,
  changePassword,
  verifyCompanyOTP
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";
import { uploader } from './../utils/files.js';
import { createCategory, deleteCategory, getAllCategories, getAllVisibleCategories, getCategoryById, toggleCategoryVisibility, updateCategory } from "../controllers/categoriesController.js";
const router = express.Router();

const uploadProfile = uploader('profile').single('image');
router.post("/register-company", uploadProfile, registerCompany);
router.post("/login-company", loginCompany);
router.post("/verify-otp", verifyCompanyOTP); 
router.post("/update-profile", companyAuthMiddleware , uploadProfile,updateProfile); 
router.post("/change-password", companyAuthMiddleware ,changePassword);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.put("/update-job", companyAuthMiddleware, updateJob);
router.post("/delete-job", companyAuthMiddleware, deleteJob);

router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);



router.post("/create-category", companyAuthMiddleware, createCategory);
router.put("/update-category", companyAuthMiddleware, updateCategory);
router.post("/delete-category", companyAuthMiddleware, deleteCategory);
router.get("/categories", companyAuthMiddleware, getAllCategories);
router.post("/category-by-id", companyAuthMiddleware, getCategoryById);
router.post("/toggle-visibility", companyAuthMiddleware, toggleCategoryVisibility);
router.get("/getAllVisibleCategories", companyAuthMiddleware, getAllVisibleCategories);

export default router;
