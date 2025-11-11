import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: { type: String, required: true },
  location: {
    city: { type: String, required: [true, "City is required"], trim: true },
    state: { type: String, required: [true, "State is required"], trim: true },
    country: { type: String, required: [true, "Country is required"], trim: true },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, "Invalid 6-digit pincode"] }
  },
  description: { type: String, required: true },
  salaryMin: { type: Number, min: [0, "Salary cannot be negative"], default: null },
  salaryMax: {
    type: Number,
    min: [0, "Salary cannot be negative"],
    default: null,
    validate: {
      validator: function (value) { return !this.salaryMin || !value || value >= this.salaryMin; },
      message: "Salary max must be greater than or equal to salary min"
    }
  },
  jobType: { type: String, required: [true, "Job type is required"], enum: ["full-time", "part-time", "contract", "internship", "temporary"], default: "full-time" },
  experienceLevel: { type: String, enum: ["entry", "mid", "senior", "executive"], default: "entry" },
  skills: [{ type: String, trim: true, maxlength: 50 }],
  category: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  employmentType: { type: String, enum: ["permanent", "contract", "freelance"], default: "permanent" },
  remoteOption: { type: String, enum: ["remote", "hybrid", "on-site"], default: "on-site" },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

export default Job;
