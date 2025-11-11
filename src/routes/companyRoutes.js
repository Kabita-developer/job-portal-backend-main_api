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
  updateCompanyProfile,
  changeCompanyPassword,
  changePassword,
  verifyCompanyOTP
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.put("/update-profile", companyAuthMiddleware, upload.single("image"), updateCompanyProfile);
router.put("/change-password", companyAuthMiddleware, changeCompanyPassword);
router.post("/login-company", loginCompany);
router.post("/verify-otp", verifyCompanyOTP); 
router.post("/update-profile", companyAuthMiddleware ,updateProfile); 
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

export default router;
