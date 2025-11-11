import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: "" },
  otp: { type: String },
  isEmailVerified: { type: Boolean, default: false }, 
  otpExpires: { type: Date },
});

const User = mongoose.model("User", userSchema);

export default User;