import express from "express";
import { getSQLFromPrompt } from "../controllers/aiController.js";

const router = express.Router();
router.post("/generate", getSQLFromPrompt);

export default router;
