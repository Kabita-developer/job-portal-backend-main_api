import Category from "../models/Category.js";
import Job from "../models/Job.js";

export const createCategory = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    const existingCategory = await Category.findOne({ type });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const category = new Category({ type, usageCount: 0, isVisible: true });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      categoryData: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Category creation failed",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const { id, type, isVisible } = req.body; // Added isVisible

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    const existingCategory = await Category.findOne({ type, _id: { $ne: id } });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "Category type already exists" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { type, isVisible: isVisible !== undefined ? isVisible : true }, // Allow updating isVisible
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      categoryData: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category type already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Category update failed",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if category is used in any jobs
    const jobCount = await Job.countDocuments({ category: id });
    if (jobCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category because it is used in existing jobs",
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Category deletion failed",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const categories = await Category.find({ isVisible: true }); // Only fetch visible categories

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: categories,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getAllVisibleCategories = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const categories = await Category.find().sort({ type: 1 }); 
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category: category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

export const toggleCategoryVisibility = async (req, res) => {
  try {
    if (!req.companyData || !req.companyData._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Company data not found",
      });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Toggle isVisible
    category.isVisible = !category.isVisible;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category visibility ${category.isVisible ? 'enabled' : 'disabled'} successfully`,
      categoryData: category,
    });
  } catch (error) {
    console.error("Toggle category visibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle category visibility",
    });
  }
};