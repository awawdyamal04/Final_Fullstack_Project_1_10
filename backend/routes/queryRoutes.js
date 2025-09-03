import express from "express";
import { handleRunQuery, exportQueryAsCSV, exportQueryAsJSON } from "../controllers/queryController.js";
const router = express.Router();

router.post("/run", handleRunQuery);

// Add export routes
router.get("/export/csv", exportQueryAsCSV);
router.get("/export/json", exportQueryAsJSON);

export default router;