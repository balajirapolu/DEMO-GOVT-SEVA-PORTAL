import { Router } from "express";
import { isAdmin } from "../middleware/auth";
import path from "path";
import fs from "fs";

const router = Router();

// Serve supporting documents
router.get("/documents/:filename", isAdmin, async (req, res) => {
  const { filename } = req.params;
  
  // Security: Ensure the filename doesn't contain path traversal
  const safePath = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(process.cwd(), "uploads", safePath);

  // Check if file exists
  try {
    await fs.promises.access(filePath);
  } catch (error) {
    return res.status(404).json({ message: "File not found" });
  }

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  
  // Set content type based on extension
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

export default router;
