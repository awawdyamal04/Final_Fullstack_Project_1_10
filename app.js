import queryRoutes from './backend/routes/queryRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import historyRoutes from './backend/routes/historyRoutes.js';
import dbRouter from "./backend/routes/dbRoutes.js";
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './backend/middleware/db.js';
import userRoutes from "./backend/routes/userRoutes.js";
import googleAuthRoutes from "./backend/routes/googleAuthRoutes.js";
import express from 'express';
import fs from "fs";
import path from "path";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./backend/config/passport.js";

function cleanupUploads() {
  const uploadDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadDir)) {
    console.log("Uploads directory does not exist:", uploadDir);
    return;
  }

  const files = fs.readdirSync(uploadDir);
  if (files.length === 0) {
    console.log("Uploads directory is already empty.");
    return;
  }

  console.log("Cleaning up files in uploads directory:", files);

  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log("Deleted:", filePath);
    } catch (err) {
      console.error("Failed to delete:", filePath, err);
    }
  }
}

dotenv.config();
const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use("/api/db", dbRouter);

// Connect to the database when the server starts
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Gracefully disconnect from the database on server shutdown
// When server is shutting down
process.on("SIGINT", () => {
  console.log("Cleaning up uploaded files...");
  cleanupUploads();
  process.exit();
});

process.on("SIGTERM", () => {
  console.log("Cleaning up uploaded files...");
  cleanupUploads();
  process.exit();
});