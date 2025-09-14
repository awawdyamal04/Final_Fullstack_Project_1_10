import fs from "fs";
import { validateDbFile, readDbSchema } from "../services/dbServices.js";
import { setCurrentDbPath, getCurrentDbPath } from "../config/dbState.js";


// Upload .db file
export async function uploadDbFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newFilePath = req.file.path;
    const oldFilePath = getCurrentDbPath();
    // If a previous DB file exists, delete it
    if (oldFilePath && oldFilePath !== newFilePath) {
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old DB file:", err);
        } else {
          console.log("Deleted old DB file:", oldFilePath);
        }
      });
    }

    // Validate the new DB file
    await validateDbFile(newFilePath);

    // Save the new path
    setCurrentDbPath(newFilePath);

    res.json({
      message: "Database loaded successfully",
      path: newFilePath,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Return schema (tables + columns)
export async function getDbSchema(req, res) {
  try {
    const currentDbPath = getCurrentDbPath();
    if (!currentDbPath) {
      return res.status(400).json({ error: "No database loaded" });
    }

    const schema = await readDbSchema(currentDbPath);
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
