import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateGoogleUser } from "../services/googleAuthService.js";
import dotenv from "dotenv";

dotenv.config();

// Configure Passport to use Google OAuth strategy only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.warn("⚠️  Google OAuth credentials not found. Google login will be disabled.");
  console.warn("   Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file");
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { User } = await import("../models/User.js");
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
