import { type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    adminId?: number;
  }
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  next();
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const admin = await storage.getAdmin(req.session.adminId);
  if (!admin) {
    res.status(401).json({ message: "Admin not found" });
    return;
  }

  next();
}
