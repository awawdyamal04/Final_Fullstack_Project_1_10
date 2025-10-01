import { findOrCreateGoogleUser } from "../services/googleAuthService.js";
import jwt from "jsonwebtoken";

export async function googleAuth(req, res) {
  try {
    // This will be called by Passport after successful authentication
    const user = req.user;
    
    // Normalize response to match what frontend expects
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Google authentication failed" 
    });
  }
}

export async function googleAuthCallback(req, res) {
  try {
    // This handles the callback after Google authentication
    const user = req.user;
    
    if (!user) {
      console.error("No user found in Google auth callback");
      res.redirect(`http://localhost:5173/#login?error=${encodeURIComponent("No user data received")}`);
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with user data and token
    const userData = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      token: token
    };
    
    // Create a redirect URL with user data (using hash-based routing)
    const redirectUrl = `http://localhost:5173/#login?success=true&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`http://localhost:5173/#login?error=${encodeURIComponent("Google authentication failed")}`);
  }
}

export async function googleAuthFailure(req, res) {
  res.redirect(`http://localhost:5173/#login?error=${encodeURIComponent("Google authentication failed")}`);
}

export async function logout(req, res) {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
  });
  res.redirect("http://localhost:5173/#login");
}
