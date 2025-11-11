import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  role: { type: String, default: "admin", enum: ["admin", "superadmin"] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
