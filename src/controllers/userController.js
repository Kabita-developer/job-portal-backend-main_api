import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { generateOTP, sendVerificationMail } from "../utils/email-verification.js";

export const registerUser = async (req, res) => {
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
      return res.status(400).json({ success: false, message: "Upload your image" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUploadUrl = await cloudinary.uploader.upload(imageFile.path);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUploadUrl.secure_url,
      otp,
      otpExpires,
    });

    await user.save();

    // Send OTP to user's email
    await sendVerificationMail(email, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      // Generate and save new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send new OTP to user's email
      await sendVerificationMail(email, otp);

      return res.status(200).json({
        success: false,
        isEmailVerified:false,
        message: "Email not verified. A new OTP has been sent to your email.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
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
    const userData = req.userData;

    const company = await User.findById(userData?._id);
    if (!company) {
      return res.status(404).json({ success: false, message: "user not found" });
    }

    await User.findByIdAndUpdate(userData?._id,{$set:{...data}});
    return res.status(200).json({ success: true, message: "user details updated successfully" });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "failed to update" });
  }
}

export const changePassword = async(req,res)=>{
  try{
    const { currentPassword, newPassword } = req.body;
  const userId = req.userData?._id;
  let user = await User.findById(userId);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (isMatch) {
    let hashedPassword = await bcrypt.hash(newPassword,10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    return res.status(200).json({ success: true, message: "password changed successfully" });
  }
  return res.status(400).json({ success: true, message: "Invalid password" });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "failed to update" });
  }
}

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload resume to Cloudinary
    const uploadedResumeUrl = await cloudinary.uploader.upload(resumeFile.path);
    userData.resume = uploadedResumeUrl.secure_url;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: userData.resume,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};
