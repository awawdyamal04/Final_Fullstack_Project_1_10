import multer from "multer";
import fs from "fs";
import path from "path";

// ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // always save in /uploads
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original filename
  },
});

function fileFilter(req, file, cb) {
  // Allow all file types for now (you can restrict if needed)
  cb(null, true);
}

export const upload = multer({ storage, fileFilter });