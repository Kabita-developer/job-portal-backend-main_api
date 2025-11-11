import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import generateToken from "../utils/generateToken.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { generateOTP, sendVerificationMail } from "../utils/email-verification.js";

export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.status(400).json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Upload your logo" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(409).json({ success: false, message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
      otp,
      otpExpires,
    });

    await company.save();

    // Send OTP to company's email
    await sendVerificationMail(email, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      companyData: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const { name, email, companyId } = req.body; // Get companyId from FormData
    const imageFile = req.file;

    // Check if req.companyData exists (from companyAuthMiddleware)
    if (!req.companyData || !req.companyData._id) {
      console.log("req.companyData is undefined or missing _id"); // Debug
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    // Use companyId from FormData if provided, otherwise use req.companyData._id
    const finalCompanyId = companyId || req.companyData._id.toString();

    // Validate that companyId matches req.companyData._id (for security)
    if (companyId && companyId !== req.companyData._id.toString()) {
      console.log("Company ID mismatch:", { sent: companyId, expected: req.companyData._id }); // Debug
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Company ID mismatch",
      });
    }

    // Validation
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Company name is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check if email is already taken by another company
    const existingCompany = await Company.findOne({ 
      email, 
      _id: { $ne: finalCompanyId } 
    });

    if (existingCompany) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    // Find the current company
    const company = await Company.findById(finalCompanyId);
    if (!company) {
      console.log("Company not found for ID:", finalCompanyId); // Debug
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
    };

    // Handle image upload if provided
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }
    }

    // Update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      finalCompanyId,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      companyData: {
        _id: updatedCompany._id,
        name: updatedCompany.name,
        email: updatedCompany.email,
        image: updatedCompany.image,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const changeCompanyPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword, companyId } = req.body;
    console.log("Change password request body:", { oldPassword: "***", newPassword: "***", confirmPassword: "***", companyId }); // Debug

    // Check if req.companyData exists (from companyAuthMiddleware)
    if (!req.companyData || !req.companyData._id) {
      console.log("req.companyData is undefined or missing _id");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    // Use companyId from request body if provided, otherwise use req.companyData._id
    const finalCompanyId = companyId || req.companyData._id.toString();

    // Validate that companyId matches req.companyData._id (for security)
    if (companyId && companyId !== req.companyData._id.toString()) {
      console.log("Company ID mismatch:", { sent: companyId, expected: req.companyData._id });
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Company ID mismatch",
      });
    }

    // Validation
    if (!oldPassword) {
      return res.status(400).json({ success: false, message: "Old password is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: "Confirm password is required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Find the company
    const company = await Company.findById(finalCompanyId);
    if (!company) {
      console.log("Company not found for ID:", finalCompanyId);
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, company.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid old password" });
    }

    // Prepare update data
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedCompany = await Company.findByIdAndUpdate(
      finalCompanyId,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      companyData: {
        _id: updatedCompany._id,
        name: updatedCompany.name,
        email: updatedCompany.email,
        image: updatedCompany.image,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
// Middleware to authenticate and get company data
export const authenticateCompany = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify token and get company data
    // Replace this with your actual token verification logic
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const company = await Company.findById(decoded.companyId);

    if (!company) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Company not found."
      });
    }

    req.company = company;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (!company.isEmailVerified) {
      // Generate and save new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      company.otp = otp;
      company.otpExpires = otpExpires;
      await company.save();

      // Send new OTP to company's email
      await sendVerificationMail(email, otp);

      return res.status(200).json({
        success: false,
        isEmailVerified:false,
        message: "Email not verified. A new OTP has been sent to your email.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      companyData: company,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const verifyCompanyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (company.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (company.otp !== otp || company.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    company.isEmailVerified = true;
    company.otp = undefined;
    company.otpExpires = undefined;
    await company.save();

    const token = await generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      companyData: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

export const updateProfile = async(req,res)=>{
  try{
    const {data} = req.body;
    const companyData = req.companyData;

    const company = await Company.findById(companyData?._id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    await Company.findByIdAndUpdate(companyData?._id,{$set:{...data}});
    return res.status(200).json({ success: true, message: "Company details updated successfully" });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "failed to update" });
  }
}

export const changePassword = async(req,res)=>{
  try{
    const { currentPassword, newPassword } = req.body;
  const userId = req.companyData?._id;
  let user = await Company.findById(userId);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (isMatch) {
    let hashedPassword = await bcrypt.hash(newPassword,10);
    await Company.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    return res.status(200).json({ success: true, message: "password changed successfully" });
  }
  return res.status(400).json({ success: true, message: "Invalid password" });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "failed to update" });
  }
}

export const fetchCompanyData = async (req, res) => {
  try {
    const company = req.companyData;

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company data fetched successfully",
      companyData: company,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company data",
    });
  }
};

export const postJob = async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      salaryMin,
      salaryMax,
      jobType,
      experienceLevel,
      skills,
      category,
      employmentType,
      remoteOption,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !jobType) {
      return res.status(400).json({
        success: false,
        message: "Required fields (title, description, location, category, jobType) are missing",
      });
    }

    // Validate nested level object
    if (!location.city || !location.state || !location.country) {
      return res.status(400).json({
        success: false,
        message: "City, state, and country are required in location",
      });
    }

    const companyId = req.companyData._id;

    // Create new job
    const job = new Job({
      title,
      location,
      description,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      jobType,
      experienceLevel: experienceLevel || "entry",
      skills: skills || [],
      category,
      companyId,
      employmentType: employmentType || "permanent",
      remoteOption: remoteOption || "on-site",
      visible: true,
    });

    await job.save();

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      jobData: job,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job posting failed",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const {
      id,
      title,
      location,
      description,
      salaryMin,
      salaryMax,
      jobType,
      experienceLevel,
      skills,
      category,
      employmentType,
      remoteOption,
      visible,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    if (!title || !description || !location || !category || !jobType ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!location.city || !location.state || !location.country) {
      return res.status(400).json({
        success: false,
        message: "City, state, and country are required in location",
      });
    }

    const companyId = req.companyData._id;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this job",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title,
        location,
        description,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        jobType,
        experienceLevel: experienceLevel || "entry",
        skills: skills || [],
        category,
        employmentType: employmentType || "permanent",
        remoteOption: remoteOption || "on-site",
        visible: visible !== undefined ? visible : true,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      jobData: updatedJob,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job update failed",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const companyId = req.companyData._id;

    // Find the job and verify it belongs to the company
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the job belongs to the requesting company
    if (job.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this job",
      });
    }

    // Check if there are any job applications for this job
    const applications = await JobApplication.find({ jobId: id });

    if (applications.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete job because it has existing applications",
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Job deletion failed",
    });
  }
};

export const getCompanyPostedAllJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const jobs = await Job.find({ companyId });

    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });

        return { ...job.toObject(), applicants: applicants.length };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobData: jobsData,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job fetching failed",
    });
  }
};

export const changeJobVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.companyId.toString() === companyId.toString()) {
      job.visible = !job.visible;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Visibility changed",
    });
  } catch (error) {
    console.error("Error changing job visibility:", error);
    return res.status(500).json({
      success: false,
      message: "Visibility change failed",
    });
  }
};

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const applicants = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Applicants fetched successfully",
      viewApplicationData: applicants,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required",
      });
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status changed successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to change status",
    });
  }
};
