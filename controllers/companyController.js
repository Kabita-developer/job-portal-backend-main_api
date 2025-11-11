import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import generateToken from "../utils/generateToken.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { generateOTP, sendVerificationMail } from "../utils/email-verification.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req?.file?.path || '';

    if (!name) {
      return res.status(400).json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Enter your password" });
    }

    if (!imageFile || imageFile == '') {
      return res.status(400).json({ success: false, message: "Upload your logo" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(409).json({ success: false, message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      image: imageFile,
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
    const data = req.body || {};
    const companyData = req.companyData;
    const imageFile = req?.file?.path;
  
    const company = await Company.findById(companyData?._id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    data.image = imageFile || company?.image;
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

    // Update category usage count
    const cat = await Category.findById(category);
    if (cat) {
      cat.usageCount += 1;
      await cat.save();
    }

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

    const oldCategory = job.category;

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

    // Update category usage counts if category changed
    if (oldCategory.toString() !== category.toString()) {
      // Decrement old category
      await Category.findByIdAndUpdate(oldCategory, { $inc: { usageCount: -1 } }, { new: true });

      // Increment new category
      await Category.findByIdAndUpdate(category, { $inc: { usageCount: 1 } }, { new: true });
    }

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

    // Extract query parameters for search, filters, and pagination
    const {
      search, // General search term (for title, skills, location)
      category, // Filter by category ID
      isVisible, // Filter by visibility (true/false)
      page = 1, // Pagination: page number
      limit = 10, // Pagination: items per page
    } = req.query;

    // Build the query object
    let query = { companyId };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      query.$or = [
        { title: searchRegex },
        { skills: { $in: [searchRegex] } },
        { "location.city": searchRegex },
        { "location.state": searchRegex },
        { "location.country": searchRegex },
      ];
    }

    // Filter by category
    if (category) {
      query.category =new mongoose.Types.ObjectId(category);
    }

    // Filter by visibility
    if (isVisible !== undefined) {
      query.visible = isVisible === "true" || isVisible === true;
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch jobs with pagination and populate category
    const jobs = await Job.find(query)
      .populate("category", "type")
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination metadata
    const totalJobs = await Job.countDocuments(query);

    // Fetch applicant count for each job
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id }).countDocuments();
        return { ...job, applicants };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobData: jobsData,
      pagination: {
        total: totalJobs,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalJobs / limitNum),
      },
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

    // Extract parameters from request body instead of query
    const {
      search, // Search by job title, location, or username
      status, // Filter by application status
      page = 1, // Pagination: page number
      limit = 10, // Pagination: items per page
    } = req.body;

    // Build the base query object
    let query = { companyId };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // If search is provided, we need to use aggregation to search populated fields
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      
      // Use aggregation pipeline for search functionality
      const pipeline = [
        // Match company applications first
        {
          $match: {
            companyId:new mongoose.Types.ObjectId(companyId),
            ...(status && { status: status })
          }
        },
        // Lookup user data
        {
          $lookup: {
            from: "users", // Make sure this matches your actual collection name
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        // Lookup job data  
        {
          $lookup: {
            from: "jobs", // Make sure this matches your actual collection name
            localField: "jobId",
            foreignField: "_id", 
            as: "jobDetails"
          }
        },
        // Unwind arrays
        {
          $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true }
        },
        // Search in populated fields
        {
          $match: {
            $or: [
              { "jobDetails.title": searchRegex },
              { "jobDetails.location.city": searchRegex },
              { "jobDetails.location.state": searchRegex },
              { "jobDetails.location.country": searchRegex },
              { "userDetails.name": searchRegex },
            ],
          }
        },
        // Project to match the original populate structure
        {
          $project: {
            _id: 1,
            companyId: 1,
            status: 1,
            date: 1,
            createdAt: 1,
            updatedAt: 1,
            userId: {
              _id: "$userDetails._id",
              name: "$userDetails.name",
              image: "$userDetails.image",
              resume: "$userDetails.resume"
            },
            jobId: {
              _id: "$jobDetails._id",
              title: "$jobDetails.title",
              location: "$jobDetails.location",
              date: "$jobDetails.date",
              status: "$jobDetails.status"
            }
          }
        },
        // Sort by creation date (newest first)
        { $sort: { createdAt: -1 } }
      ];

      // Get total count for pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await JobApplication.aggregate(countPipeline);
      const totalApplicants = countResult.length > 0 ? countResult[0].total : 0;

      // Add pagination to main pipeline  
      pipeline.push({ $skip: skip }, { $limit: limitNum });

      // Execute aggregation
      const applicants = await JobApplication.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        message: "Applicants fetched successfully",
        viewApplicationData: applicants,
        pagination: {
          total: totalApplicants,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalApplicants / limitNum),
        },
      });
    } else {
      // No search - use the original populate method
      const applicants = await JobApplication.find(query)
        .populate("userId", "name image resume")
        .populate("jobId", "title location date status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get total count for pagination metadata
      const totalApplicants = await JobApplication.countDocuments(query);

      return res.status(200).json({
        success: true,
        message: "Applicants fetched successfully",
        viewApplicationData: applicants,
        pagination: {
          total: totalApplicants,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalApplicants / limitNum),
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: true,
      message: "Failed to fetch applicants",
      error: error.message,
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
