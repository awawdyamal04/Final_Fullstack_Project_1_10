import express from "express";
import { handleRunQuery, exportQueryAsCSV, exportQueryAsJSON } from "../controllers/queryController.js";
import { detectGuest } from "../middleware/auth.js";
const router = express.Router();

router.post("/run", detectGuest, handleRunQuery);

// Add export routes
router.get("/export/csv", exportQueryAsCSV);
router.get("/export/json", exportQueryAsJSON);

export default router;