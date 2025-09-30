import { Router } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const router = Router();

router.post("/guest", (req, res) => {
  try {
    console.log("Environment check:", {
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('SECRET'))
    });
    
    const jwtSecret = process.env.JWT_SECRET || "temp-jwt-secret-for-testing";
    
    if (!process.env.JWT_SECRET) {
      console.warn("⚠️  Using temporary JWT_SECRET. Please set JWT_SECRET in .env file");
    }
    
    const payload = { sub: `guest:${randomUUID()}`, role: "guest", trial: true };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "2h" });
    res.json({ token, role: "guest", trial: true });
  } catch (error) {
    console.error("Guest authentication error:", error);
    res.status(500).json({ error: "Failed to create guest token" });
  }
});

export default router;
