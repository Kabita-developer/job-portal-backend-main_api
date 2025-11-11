import Job from "../models/Job.js";

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visible: true })
      .populate("companyId", "-password")
      .populate("category", "type");

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobData: jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Job fetching failed",
    });
  }
};

export default getAllJobs;
