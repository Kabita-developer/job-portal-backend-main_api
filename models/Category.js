import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  type: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 }, // Tracks number of jobs using this category
  isVisible: { type: Boolean, default: true }, // Controls category visibility
});

const Category = mongoose.model("Category", categorySchema);

export default Category;