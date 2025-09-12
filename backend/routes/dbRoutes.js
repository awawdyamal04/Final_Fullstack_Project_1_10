import express from "express";
import multer from "multer";
import { uploadDbFile, getDbSchema } from "../controllers/dbController.js";
import {upload} from "../middleware/uploadConfig.js";

const router = express.Router();

// POST /api/db/upload
router.post("/upload", upload.single("dbfile"), uploadDbFile);

// GET /api/db/schema
router.get("/schema", getDbSchema);

export default router;