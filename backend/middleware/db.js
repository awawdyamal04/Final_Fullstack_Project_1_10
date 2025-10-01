import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
const mongoURI = process.env.MONGO_URI;

export async function connectDB() {
  if (!mongoURI) {
    throw new Error('Missing MONGODB_URI in .env');
  }
  
  try {
    await mongoose.connect(mongoURI, { 
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Failed to disconnect from MongoDB", err);
  }
}