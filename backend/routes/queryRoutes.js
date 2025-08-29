import express from "express";
import { handleRunQuery } from "../controllers/queryController.js";

const router = express.Router();

router.post("/run", handleRunQuery);

export default router;