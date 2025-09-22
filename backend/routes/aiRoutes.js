import express from "express";
import { getSQLFromPrompt, explainSQLController } from "../controllers/aiController.js";

const router = express.Router();
router.post("/generate", getSQLFromPrompt);
router.post("/explain", explainSQLController);

export default router;
