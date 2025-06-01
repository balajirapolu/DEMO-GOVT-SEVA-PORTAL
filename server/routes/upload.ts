import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { storage } from "../storage";

const router = Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "client", "public", "uploads"));
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only PDFs and images
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload supporting documents
router.post("/documents", isAuthenticated, upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Get file paths
    const filePaths = (req.files as Express.Multer.File[]).map(file => 
      `/uploads/${file.filename}`
    );

    res.json({ files: filePaths });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload files" });
  }
});

export default router;
