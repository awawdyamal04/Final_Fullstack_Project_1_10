import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional for Google OAuth users
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    profilePicture: { type: String }, // For storing Google profile picture
});

export const User = mongoose.model('User', userSchema);