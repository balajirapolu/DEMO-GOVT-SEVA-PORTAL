import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  aadhaarNumber: text("aadhaar_number").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: text("date_of_birth"),
  type: text("type").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  department: text("department"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const aadhaarTable = sqliteTable("aadhaar_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  aadhaarNumber: text("aadhaar_number").notNull().unique(),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  issueDate: text("issue_date"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).defaultNow(),
});

export const panTable = sqliteTable("pan_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  panNumber: text("pan_number").notNull().unique(),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address"),
  issueDate: text("issue_date"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).defaultNow(),
});

export const voterIdTable = sqliteTable("voterid_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  voterIdNumber: text("voter_id_number").notNull().unique(),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"),
  address: text("address").notNull(),
  constituency: text("constituency"),
  issueDate: text("issue_date"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).defaultNow(),
});

export const drivingLicenseTable = sqliteTable("driving_license_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  vehicleClass: text("vehicle_class"),
  issueDate: text("issue_date"),
  expiryDate: text("expiry_date"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).defaultNow(),
});

export const rationCardTable = sqliteTable("ration_card_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  rationCardNumber: text("ration_card_number").notNull().unique(),
  name: text("name").notNull(),
  familyMembers: integer("family_members"),
  category: text("category"), // APL, BPL, AAY
  address: text("address").notNull(),
  issueDate: text("issue_date"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).defaultNow(),
});

export const changeRequests = sqliteTable("change_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceId: text("reference_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(), // aadhaar, pan, voterid, driving_license, ration_card
  changeType: text("change_type").notNull(), // minor, major
  fieldToUpdate: text("field_to_update").notNull(),
  newValue: text("new_value").notNull(),
  oldValue: text("old_value"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  supportingDocuments: text("supporting_documents"), // comma-separated file paths
  submittedAt: integer("submitted_at", { mode: "timestamp" }).defaultNow(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewedBy: integer("reviewed_by").references(() => admins.id),
  comments: text("comments"),
});

// Track field change counts for minor changes
export const fieldChangeTracker = sqliteTable("field_change_tracker", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: text("document_type").notNull(),
  fieldName: text("field_name").notNull(),
  changeCount: integer("change_count").notNull().default(0),
  lastChanged: integer("last_changed", { mode: "timestamp" }).defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertAadhaarSchema = createInsertSchema(aadhaarTable).omit({
  id: true,
  lastUpdated: true,
});

export const insertPanSchema = createInsertSchema(panTable).omit({
  id: true,
  lastUpdated: true,
});

export const insertVoterIdSchema = createInsertSchema(voterIdTable).omit({
  id: true,
  lastUpdated: true,
});

export const insertDrivingLicenseSchema = createInsertSchema(drivingLicenseTable).omit({
  id: true,
  lastUpdated: true,
});

export const insertRationCardSchema = createInsertSchema(rationCardTable).omit({
  id: true,
  lastUpdated: true,
});

export const insertChangeRequestSchema = createInsertSchema(changeRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertFieldChangeTrackerSchema = createInsertSchema(fieldChangeTracker).omit({
  id: true,
  lastChanged: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type AadhaarDocument = typeof aadhaarTable.$inferSelect;
export type InsertAadhaarDocument = z.infer<typeof insertAadhaarSchema>;

export type PanDocument = typeof panTable.$inferSelect;
export type InsertPanDocument = z.infer<typeof insertPanSchema>;

export type VoterIdDocument = typeof voterIdTable.$inferSelect;
export type InsertVoterIdDocument = z.infer<typeof insertVoterIdSchema>;

export type DrivingLicenseDocument = typeof drivingLicenseTable.$inferSelect;
export type InsertDrivingLicenseDocument = z.infer<typeof insertDrivingLicenseSchema>;

export type RationCardDocument = typeof rationCardTable.$inferSelect;
export type InsertRationCardDocument = z.infer<typeof insertRationCardSchema>;

export type ChangeRequest = typeof changeRequests.$inferSelect;
export type InsertChangeRequest = z.infer<typeof insertChangeRequestSchema>;

export type FieldChangeTracker = typeof fieldChangeTracker.$inferSelect;
export type InsertFieldChangeTracker = z.infer<typeof insertFieldChangeTrackerSchema>;

// Auth schemas
export const userLoginSchema = z.object({
  aadhaarNumber: z.string().min(12).max(12),
});

export const adminLoginSchema = z.object({
  employeeId: z.string().min(1),
  password: z.string().min(1),
});

export type UserLogin = z.infer<typeof userLoginSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
