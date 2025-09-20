import express from "express";
import {
  uploadDbFile,
  getDbSchema,
  downloadDbFile,
  resetDbFile,
} from "../controllers/dbController.js";
import {upload} from "../middleware/uploadConfig.js";

const router = express.Router();

// POST /api/db/upload
router.post("/upload", upload.single("dbfile"), uploadDbFile);

// GET /api/db/schema
router.get("/schema", getDbSchema);

// GET /api/db/download
router.get("/download", downloadDbFile);

// POST /api/db/reset
router.post("/reset", resetDbFile);

export default router;