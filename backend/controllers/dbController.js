import fs from "fs";
import { validateDbFile, readDbSchema } from "../services/dbServices.js";
import { setCurrentDbPath, getCurrentDbPath, setDbSchema } from "../config/dbState.js";


// Upload .db file
export async function uploadDbFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newFilePath = req.file.path;

    // Validate the new DB file
    await validateDbFile(newFilePath);

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

      const oldOriginalCopyPath = oldFilePath.replace(/\.db$/, "_original.db");
      if (fs.existsSync(oldOriginalCopyPath)) {
        fs.unlink(oldOriginalCopyPath, (err) => {
          if (err) {
            console.error("Error deleting old original copy DB file:", err);
          } else {
            console.log("Deleted old original copy DB file:", oldOriginalCopyPath);
          }
        });
      }
    }

    // Create copy of original file that won't be modified
    const originalCopyPath = newFilePath.replace(/\.db$/, "_original.db");
    fs.copyFileSync(newFilePath, originalCopyPath);
    

    // Save the new path
    setCurrentDbPath(newFilePath);

    // Get schema
    const schema = await readDbSchema(newFilePath);
    if (schema.message) {
      return res.status(400).json({ error: schema.message });
    }
    // Save schema in memory
    setDbSchema(schema);

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

// Download the current .db file
export async function downloadDbFile(req, res) {
  try {
    const currentDbPath = getCurrentDbPath();
    if (!currentDbPath) {
      return res.status(400).json({ error: "No database loaded" });
    }
    res.download(currentDbPath, "Mdatabase.db", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Reset the current DB to its original uploaded state
export async function resetDbFile(req, res) {
  try {
    const currentDbPath = getCurrentDbPath();
    if (!currentDbPath) {
      return res.status(400).json({ error: "No database loaded" });
    }
    const originalCopyPath = currentDbPath.replace(/\.db$/, "_original.db");
    if (!fs.existsSync(originalCopyPath)) {
      return res.status(500).json({ error: "Original copy of database not found" });
    }
    // Replace current DB with original copy
    fs.copyFileSync(originalCopyPath, currentDbPath);
    res.json({ message: "Database has been reset to original state" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Clear/remove the current uploaded database
export async function clearDbFile(req, res) {
  try {
    const currentDbPath = getCurrentDbPath();
    if (!currentDbPath) {
      return res.status(200).json({ message: "No database loaded" });
    }

    // Delete the current database file
    if (fs.existsSync(currentDbPath)) {
      fs.unlinkSync(currentDbPath);
      console.log("Deleted current DB file:", currentDbPath);
    }

    // Delete the original copy if it exists
    const originalCopyPath = currentDbPath.replace(/\.db$/, "_original.db");
    if (fs.existsSync(originalCopyPath)) {
      fs.unlinkSync(originalCopyPath);
      console.log("Deleted original copy DB file:", originalCopyPath);
    }

    // Clear the database state
    setCurrentDbPath(null);
    setDbSchema(null);

    res.json({ message: "Database cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}