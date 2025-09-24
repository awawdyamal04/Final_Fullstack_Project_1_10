import express from "express";
import passport from "passport";
import { googleAuth, googleAuthCallback, googleAuthFailure, logout } from "../controllers/googleAuthController.js";

const router = express.Router();

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account" // Force account selection
  })
);

router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
  googleAuthCallback
);

router.get("/google/failure", googleAuthFailure);
router.get("/logout", logout);

export default router;
