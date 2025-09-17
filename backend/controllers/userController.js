import mongoose from "mongoose";

// Simple User schema for auth (firstName, lastName, email unique, password hashless demo)
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    const user = await User.create({ firstName, lastName, email, password });
    return res
      .status(201)
      .json({
        success: true,
        user: { id: user._id, firstName, lastName, email },
      });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to create user" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    return res
      .status(200)
      .json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to login" });
  }
}