import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  otp: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otpExpires: { type: Date },
});

const Company = mongoose.model("Company", companySchema);

export default Company;