import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  userLoginSchema, adminLoginSchema, insertChangeRequestSchema,
  type User, type Admin 
} from "@shared/schema";
import { z } from "zod";

interface AuthenticatedRequest extends Express.Request {
  user?: User;
  admin?: Admin;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Session middleware simulation
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId && !req.session.adminId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireUser = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    req.user = user;
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    const admin = await storage.getAdmin(req.session.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin session" });
    }
    req.admin = admin;
    next();
  };

  // Authentication routes
  app.post("/api/auth/user/login", async (req, res) => {
    try {
      const { aadhaarNumber } = userLoginSchema.parse(req.body);
      
      const user = await storage.getUserByAadhaar(aadhaarNumber);
      if (!user) {
        return res.status(401).json({ message: "Invalid Aadhaar number" });
      }

      (req as any).session.userId = user.id;
      res.json({ user: { id: user.id, name: user.name, aadhaarNumber: user.aadhaarNumber } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { employeeId, password } = adminLoginSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmployeeId(employeeId);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req as any).session.adminId = admin.id;
      res.json({ admin: { id: admin.id, name: admin.name, employeeId: admin.employeeId } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req: any, res) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        return res.json({ 
          type: "user", 
          user: { id: user.id, name: user.name, aadhaarNumber: user.aadhaarNumber } 
        });
      }
    }
    
    if (req.session.adminId) {
      const admin = await storage.getAdmin(req.session.adminId);
      if (admin) {
        return res.json({ 
          type: "admin", 
          admin: { id: admin.id, name: admin.name, employeeId: admin.employeeId } 
        });
      }
    }
    
    res.status(401).json({ message: "Not authenticated" });
  });

  // User document routes
  app.get("/api/user/documents", requireUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const [aadhaar, pan, voterId, drivingLicense, rationCard] = await Promise.all([
        storage.getAadhaarByUserId(userId),
        storage.getPanByUserId(userId),
        storage.getVoterIdByUserId(userId),
        storage.getDrivingLicenseByUserId(userId),
        storage.getRationCardByUserId(userId),
      ]);

      // Get pending requests for status updates
      const changeRequests = await storage.getChangeRequestsByUserId(userId);
      const pendingRequests = changeRequests.filter(req => req.status === "pending");

      res.json({
        documents: {
          aadhaar,
          pan,
          voterId,
          drivingLicense,
          rationCard,
        },
        pendingRequests,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.get("/api/user/documents/:type", requireUser, async (req: any, res) => {
    try {
      const { type } = req.params;
      const userId = req.user.id;
      
      let document;
      switch (type) {
        case "aadhaar":
          document = await storage.getAadhaarByUserId(userId);
          break;
        case "pan":
          document = await storage.getPanByUserId(userId);
          break;
        case "voterId":
          document = await storage.getVoterIdByUserId(userId);
          break;
        case "drivingLicense":
          document = await storage.getDrivingLicenseByUserId(userId);
          break;
        case "rationCard":
          document = await storage.getRationCardByUserId(userId);
          break;
        default:
          return res.status(400).json({ message: "Invalid document type" });
      }

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Error fetching document" });
    }
  });

  // Change request routes
  app.post("/api/user/change-requests", requireUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { documentType, fieldToUpdate, newValue, changeType } = req.body;

      // Get current value for comparison
      let currentValue;
      let documentId;
      switch (documentType) {
        case "aadhaar":
          const aadhaar = await storage.getAadhaarByUserId(userId);
          currentValue = aadhaar?.[fieldToUpdate as keyof typeof aadhaar];
          documentId = aadhaar?.id;
          break;
        case "pan":
          const pan = await storage.getPanByUserId(userId);
          currentValue = pan?.[fieldToUpdate as keyof typeof pan];
          documentId = pan?.id;
          break;
        case "voterId":
          const voterId = await storage.getVoterIdByUserId(userId);
          currentValue = voterId?.[fieldToUpdate as keyof typeof voterId];
          documentId = voterId?.id;
          break;
        case "drivingLicense":
          const license = await storage.getDrivingLicenseByUserId(userId);
          currentValue = license?.[fieldToUpdate as keyof typeof license];
          documentId = license?.id;
          break;
        case "rationCard":
          const rationCard = await storage.getRationCardByUserId(userId);
          currentValue = rationCard?.[fieldToUpdate as keyof typeof rationCard];
          documentId = rationCard?.id;
          break;
      }

      if (!documentId) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Handle minor changes
      if (changeType === "minor") {
        const canChange = await storage.canMakeMinorChange(userId, documentType, fieldToUpdate);
        
        if (!canChange) {
          return res.status(400).json({ 
            message: "Maximum of 2 minor changes allowed per field. Contact admin for further changes.",
            requiresAdmin: true
          });
        }

        // Apply minor change directly
        const updates = { [fieldToUpdate]: newValue };
        let updatedDoc;

        switch (documentType) {
          case "aadhaar":
            updatedDoc = await storage.updateAadhaar(documentId, updates);
            break;
          case "pan":
            updatedDoc = await storage.updatePan(documentId, updates);
            break;
          case "voterId":
            updatedDoc = await storage.updateVoterId(documentId, updates);
            break;
          case "drivingLicense":
            updatedDoc = await storage.updateDrivingLicense(documentId, updates);
            break;
          case "rationCard":
            updatedDoc = await storage.updateRationCard(documentId, updates);
            break;
        }

        // Track the change
        await storage.incrementFieldChangeCount(userId, documentType, fieldToUpdate);

        // Update all documents with common fields for minor changes too
        if (['name', 'address', 'phoneNumber', 'email'].includes(fieldToUpdate)) {
          const mockRequest = {
            userId,
            fieldToUpdate,
            newValue,
            documentType
          };
          await updateAllDocumentsWithCommonFields(mockRequest);
        }

        res.json({ 
          success: true, 
          message: "Minor change applied successfully across all documents",
          document: updatedDoc,
          changeType: "minor"
        });

      } else {
        // Handle major changes - create request with ID for admin tracking
        const referenceId = `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        const requestData = {
          ...req.body,
          userId,
          referenceId,
          oldValue: String(currentValue || ""),
        };

        const validatedData = insertChangeRequestSchema.parse(requestData);
        const changeRequest = await storage.createChangeRequest(validatedData);

        res.json({
          success: true,
          message: `Major change request submitted. Reference ID: ${referenceId}`,
          referenceId,
          changeRequest,
          changeType: "major"
        });
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error processing change request" });
    }
  });

  app.get("/api/user/change-requests", requireUser, async (req: any, res) => {
    try {
      const requests = await storage.getChangeRequestsByUserId(req.user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching change requests" });
    }
  });

  // Admin routes
  app.get("/api/admin/change-requests", requireAdmin, async (req: any, res) => {
    try {
      const requests = await storage.getAllPendingChangeRequests();
      
      // Enrich with user information
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUser(request.userId);
          return {
            ...request,
            userName: user?.name || "Unknown",
            userAadhaar: user?.aadhaarNumber || "Unknown",
          };
        })
      );

      res.json(enrichedRequests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching change requests" });
    }
  });

  // Get user documents for admin review
  app.get("/api/admin/users/:userId/documents", requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const documents = {
        user: user,
        aadhaar: await storage.getAadhaarByUserId(userId),
        pan: await storage.getPanByUserId(userId),
        voterId: await storage.getVoterIdByUserId(userId),
        drivingLicense: await storage.getDrivingLicenseByUserId(userId),
        rationCard: await storage.getRationCardByUserId(userId),
      };

      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user documents" });
    }
  });

  // Get detailed change request with user info
  app.get("/api/admin/change-requests/:id", requireAdmin, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const changeRequest = await storage.getChangeRequest(requestId);
      
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found" });
      }

      const user = await storage.getUser(changeRequest.userId);
      
      res.json({
        ...changeRequest,
        user: user
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching change request details" });
    }
  });

  app.post("/api/admin/change-requests/:id/approve", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      
      const request = await storage.getChangeRequest(parseInt(id));
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      const updatedRequest = await storage.updateChangeRequest(parseInt(id), {
        status: "approved",
        reviewedBy: req.admin.id,
        comments,
      });

      if (updatedRequest) {
        // Apply the change to the specific document
        await applyDocumentChange(updatedRequest);
        
        // Update all documents with common fields
        await updateAllDocumentsWithCommonFields(updatedRequest);
      }

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Error approving request" });
    }
  });

  app.post("/api/admin/change-requests/:id/reject", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      
      const request = await storage.getChangeRequest(parseInt(id));
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      const updatedRequest = await storage.updateChangeRequest(parseInt(id), {
        status: "rejected",
        reviewedBy: req.admin.id,
        comments,
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Error rejecting request" });
    }
  });

  // Helper function to apply document changes
  async function applyDocumentChange(request: any) {
    const updates = { [request.fieldToUpdate]: request.newValue };
    
    switch (request.documentType) {
      case "aadhaar":
        const aadhaar = await storage.getAadhaarByUserId(request.userId);
        if (aadhaar) {
          await storage.updateAadhaar(aadhaar.id, updates);
        }
        break;
      case "pan":
        const pan = await storage.getPanByUserId(request.userId);
        if (pan) {
          await storage.updatePan(pan.id, updates);
        }
        break;
      case "voterId":
        const voterId = await storage.getVoterIdByUserId(request.userId);
        if (voterId) {
          await storage.updateVoterId(voterId.id, updates);
        }
        break;
      case "drivingLicense":
        const license = await storage.getDrivingLicenseByUserId(request.userId);
        if (license) {
          await storage.updateDrivingLicense(license.id, updates);
        }
        break;
      case "rationCard":
        const rationCard = await storage.getRationCardByUserId(request.userId);
        if (rationCard) {
          await storage.updateRationCard(rationCard.id, updates);
        }
        break;
    }
  }

  // Function to update all documents with common fields when admin approves changes
  async function updateAllDocumentsWithCommonFields(request: any) {
    const commonFields = ['name', 'address', 'phoneNumber', 'email'];
    
    if (commonFields.includes(request.fieldToUpdate)) {
      const userId = request.userId;
      const fieldName = request.fieldToUpdate;
      const newValue = request.newValue;
      
      const updates = { [fieldName]: newValue };
      
      try {
        // Update all document types with the common field
        const aadhaar = await storage.getAadhaarByUserId(userId);
        if (aadhaar) {
          await storage.updateAadhaar(aadhaar.id, updates);
        }
        
        const pan = await storage.getPanByUserId(userId);
        if (pan) {
          await storage.updatePan(pan.id, updates);
        }
        
        const voterId = await storage.getVoterIdByUserId(userId);
        if (voterId) {
          await storage.updateVoterId(voterId.id, updates);
        }
        
        const drivingLicense = await storage.getDrivingLicenseByUserId(userId);
        if (drivingLicense) {
          await storage.updateDrivingLicense(drivingLicense.id, updates);
        }
        
        const rationCard = await storage.getRationCardByUserId(userId);
        if (rationCard) {
          await storage.updateRationCard(rationCard.id, updates);
        }
        
        console.log(`Synchronized ${fieldName} across all documents for user ${userId}`);
      } catch (error) {
        console.error('Error synchronizing documents:', error);
      }
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
