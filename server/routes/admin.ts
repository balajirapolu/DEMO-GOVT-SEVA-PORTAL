import { Router } from "express";
import { storage } from "../storage";
import { isAdmin } from "../middleware/auth";
import { z } from "zod";
import { validateRequest } from "../middleware/validate";

const router = Router();

// Get all pending change requests
router.get("/change-requests", isAdmin, async (req, res) => {
  const requests = await storage.getAllPendingChangeRequests();
  res.json(requests);
});

// Get user documents
router.get("/users/:userId/documents", isAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  const [aadhaar, pan, voterId, drivingLicense, rationCard] = await Promise.all([
    storage.getAadhaarByUserId(userId),
    storage.getPanByUserId(userId),
    storage.getVoterIdByUserId(userId),
    storage.getDrivingLicenseByUserId(userId),
    storage.getRationCardByUserId(userId)
  ]);

  const user = await storage.getUser(userId);

  res.json({
    user,
    aadhaar,
    pan,
    voterId,
    drivingLicense,
    rationCard
  });
});

// Get document file
router.get("/documents/:type/:userId", isAdmin, async (req, res) => {
  const { type, userId } = req.params;
  const id = parseInt(userId);

  let document;
  switch (type) {
    case 'aadhaar':
      document = await storage.getAadhaarByUserId(id);
      break;
    case 'pan':
      document = await storage.getPanByUserId(id);
      break;
    case 'voterId':
      document = await storage.getVoterIdByUserId(id);
      break;
    case 'drivingLicense':
      document = await storage.getDrivingLicenseByUserId(id);
      break;
    case 'rationCard':
      document = await storage.getRationCardByUserId(id);
      break;
    default:
      return res.status(400).json({ message: "Invalid document type" });
  }

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Generate a PDF document with the data
  const documentData = Object.entries(document)
    .filter(([key]) => !['id', 'userId', 'lastUpdated'].includes(key))
    .map(([key, value]) => ({
      field: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
      value: String(value)
    }));

  res.json({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    data: documentData,
    lastUpdated: document.lastUpdated
  });
});

// Approve change request
router.post("/change-requests/:id/approve", isAdmin, validateRequest({
  body: z.object({
    comments: z.string()
  })
}), async (req, res) => {
  const id = parseInt(req.params.id);
  const { comments } = req.body;

  const request = await storage.getChangeRequest(id);
  if (!request) {
    return res.status(404).json({ message: "Change request not found" });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Change request is not pending" });
  }

  // Get the document ID from the appropriate table
  let documentId: number;
  switch (request.documentType) {
    case "aadhaar":
      const aadhaar = await storage.getAadhaarByUserId(request.userId);
      documentId = aadhaar?.id ?? 0;
      break;
    case "pan":
      const pan = await storage.getPanByUserId(request.userId);
      documentId = pan?.id ?? 0;
      break;
    case "voterId":
      const voterId = await storage.getVoterIdByUserId(request.userId);
      documentId = voterId?.id ?? 0;
      break;
    case "drivingLicense":
      const drivingLicense = await storage.getDrivingLicenseByUserId(request.userId);
      documentId = drivingLicense?.id ?? 0;
      break;
    case "rationCard":
      const rationCard = await storage.getRationCardByUserId(request.userId);
      documentId = rationCard?.id ?? 0;
      break;
    default:
      return res.status(400).json({ message: "Invalid document type" });
  }

  if (!documentId) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Update the document with the requested changes
  const updates = {
    [request.fieldToUpdate]: request.newValue
  };

  let document;
  switch (request.documentType) {
    case "aadhaar":
      document = await storage.updateAadhaar(documentId, updates);
      break;
    case "pan":
      document = await storage.updatePan(documentId, updates);
      break;
    case "voterId":
      document = await storage.updateVoterId(documentId, updates);
      break;
    case "drivingLicense":
      document = await storage.updateDrivingLicense(documentId, updates);
      break;
    case "rationCard":
      document = await storage.updateRationCard(documentId, updates);
      break;
  }

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Update the change request status
  const updatedRequest = await storage.updateChangeRequest(id, {
    status: "approved",
    reviewedBy: (req.session as any).adminId,
    comments
  });

  res.json(updatedRequest);
});

// Reject change request
router.post("/change-requests/:id/reject", isAdmin, validateRequest({
  body: z.object({
    comments: z.string()
  })
}), async (req, res) => {
  const id = parseInt(req.params.id);
  const { comments } = req.body;

  const request = await storage.getChangeRequest(id);
  if (!request) {
    return res.status(404).json({ message: "Change request not found" });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Change request is not pending" });
  }

  const updatedRequest = await storage.updateChangeRequest(id, {
    status: "rejected",
    reviewedBy: (req.session as any).adminId,
    comments
  });

  res.json(updatedRequest);
});

export default router;
