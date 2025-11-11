import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";

import connectDB from "./db/connectDB.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import Cloudinary from "./utils/Cloudinary.js";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
const app = express();
 __filename = fileURLToPath(import.meta.url);
__dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

connectDB();
Cloudinary();

app.get("/check", (req, res) => res.send("api is working"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/', express.static(path.join(__dirname, 'public')));

// Handle /admin route to serve admin index.html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index .html'));
// });
app.use("/api", userRoutes);
app.use("/api", companyRoutes);
app.use("/company", companyRoutes); // Also mount at /company for backward compatibility
app.use("/api", jobRoutes);
app.use("/api", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐Server is running on port ${PORT}`));
