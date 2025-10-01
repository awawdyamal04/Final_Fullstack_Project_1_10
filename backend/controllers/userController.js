import { addUser, fetchUsers, loginUser } from "../services/userServices.js";
import { transporter } from "../config/mailer.js";
import { User } from "../models/User.js";
import crypto from "crypto"; // for generating secure tokens
import bcrypt from "bcrypt";


// for password hashing
//import bcrypt from "bcrypt";

export async function getUsers(req, res) {
  const users = await fetchUsers();
  res.json(users);
}

export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await addUser(firstName, lastName, email, password);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    //console.log(req.body);
    res.status(500).json({ error: "Failed to signup" });
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

    const user = await loginUser(email, password);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Normalize response to what frontend expects
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist (for security)
      return res.status(200).json({
        success: true,
        message: "If an account exists, reset instructions have been sent.",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#reset-password/${resetToken}`;

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // Development mode - log the reset link instead of sending email
      console.log("🔗 Password Reset Link (Development Mode):");
      console.log(`   Email: ${email}`);
      console.log(`   Reset Link: ${resetLink}`);
      console.log("   Note: Email configuration missing. Set EMAIL_USER and EMAIL_PASS in .env file for production.");
      
      return res.status(200).json({
        success: true,
        message: `Password reset link generated. In development mode, check the server console for the reset link: ${resetLink}`,
        resetLink: resetLink // Include the link in response for development
      });
    }

    // Production mode - send email
    const mailOptions = {
      from: '"nl2sql Support" <nl2sqlnl2sql@gmail.com>',
      to: email,
      subject: "Password Reset Request - NL2SQL",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email address.",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to process password reset request" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // still valid
    });

    

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "Failed to reset password" });
  }
}
