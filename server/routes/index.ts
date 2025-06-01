import { type Express } from "express";
import { createServer } from "http";
import auth from "./auth";
import admin from "./admin";
import upload from "./upload";
import express from "express";

export async function registerRoutes(app: Express) {
  // Register all routes
  app.use("/api/auth", auth);
  app.use("/api/admin", admin);
  app.use("/api/upload", upload);
  
  // Serve static files from client/public
  app.use(express.static("client/public"));

  return createServer(app);
}
