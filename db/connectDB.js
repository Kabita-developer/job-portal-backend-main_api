import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.log(error);
    console.log("❎ Database connection failed");
  }
};

export default connectDB;
