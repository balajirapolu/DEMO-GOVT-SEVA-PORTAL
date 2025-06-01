import { db } from "./db";
import { 
  users, admins, aadhaarTable, panTable, voterIdTable, 
  drivingLicenseTable, rationCardTable, changeRequests, fieldChangeTracker,
  type User, type InsertUser, type Admin, type InsertAdmin,
  type AadhaarDocument, type InsertAadhaarDocument,
  type PanDocument, type InsertPanDocument,
  type VoterIdDocument, type InsertVoterIdDocument,
  type DrivingLicenseDocument, type InsertDrivingLicenseDocument,
  type RationCardDocument, type InsertRationCardDocument,
  type ChangeRequest, type InsertChangeRequest,
  type FieldChangeTracker, type InsertFieldChangeTracker
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByAadhaar(aadhaarNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin management
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByEmployeeId(employeeId: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Document management
  getAadhaarByUserId(userId: number): Promise<AadhaarDocument | undefined>;
  getPanByUserId(userId: number): Promise<PanDocument | undefined>;
  getVoterIdByUserId(userId: number): Promise<VoterIdDocument | undefined>;
  getDrivingLicenseByUserId(userId: number): Promise<DrivingLicenseDocument | undefined>;
  getRationCardByUserId(userId: number): Promise<RationCardDocument | undefined>;

  createAadhaar(doc: InsertAadhaarDocument): Promise<AadhaarDocument>;
  createPan(doc: InsertPanDocument): Promise<PanDocument>;
  createVoterId(doc: InsertVoterIdDocument): Promise<VoterIdDocument>;
  createDrivingLicense(doc: InsertDrivingLicenseDocument): Promise<DrivingLicenseDocument>;
  createRationCard(doc: InsertRationCardDocument): Promise<RationCardDocument>;

  updateAadhaar(id: number, updates: Partial<AadhaarDocument>): Promise<AadhaarDocument | undefined>;
  updatePan(id: number, updates: Partial<PanDocument>): Promise<PanDocument | undefined>;
  updateVoterId(id: number, updates: Partial<VoterIdDocument>): Promise<VoterIdDocument | undefined>;
  updateDrivingLicense(id: number, updates: Partial<DrivingLicenseDocument>): Promise<DrivingLicenseDocument | undefined>;
  updateRationCard(id: number, updates: Partial<RationCardDocument>): Promise<RationCardDocument | undefined>;

  // Change request management
  getChangeRequest(id: number): Promise<ChangeRequest | undefined>;
  getChangeRequestByReference(referenceId: string): Promise<ChangeRequest | undefined>;
  getChangeRequestsByUserId(userId: number): Promise<ChangeRequest[]>;
  getAllPendingChangeRequests(): Promise<ChangeRequest[]>;
  createChangeRequest(request: InsertChangeRequest): Promise<ChangeRequest>;
  updateChangeRequest(id: number, updates: Partial<ChangeRequest>): Promise<ChangeRequest | undefined>;

  // Field change tracking
  getFieldChangeCount(userId: number, documentType: string, fieldName: string): Promise<number>;
  incrementFieldChangeCount(userId: number, documentType: string, fieldName: string): Promise<void>;
  canMakeMinorChange(userId: number, documentType: string, fieldName: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      // Check if admin already exists
      const existingAdmin = await this.getAdminByEmployeeId("GOV001");
      if (!existingAdmin) {
        // Create sample admin
        await this.createAdmin({
          employeeId: "GOV001",
          name: "Officer Sharma",
          password: "admin123",
          department: "Document Management",
        });
      }

      // Check if sample users already exist
      const existingUser = await this.getUserByAadhaar("123456789012");
      if (!existingUser) {
        // Create multiple sample users
        const user1 = await this.createUser({
          aadhaarNumber: "123456789012",
          name: "Rajesh Kumar",
          email: "baparao2005@gmail.com",
          phone: "9876543210",
          address: "123, MG Road, Delhi - 110001",
          dateOfBirth: "15-Aug-1985",
          type: "user",
        });

        const user2 = await this.createUser({
          aadhaarNumber: "234567890123",
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "9765432109",
          address: "456, Sector 15, Gurgaon - 122001",
          dateOfBirth: "22-Mar-1990",
          type: "user",
        });

        const user3 = await this.createUser({
          aadhaarNumber: "345678901234",
          name: "Amit Singh",
          email: "amit.singh@example.com",
          phone: "9654321098",
          address: "789, Park Street, Kolkata - 700016",
          dateOfBirth: "08-Dec-1987",
          type: "user",
        });

        const user4 = await this.createUser({
          aadhaarNumber: "456789012345",
          name: "Sunita Devi",
          email: "sunita.devi@example.com",
          phone: "9543210987",
          address: "321, Civil Lines, Jaipur - 302006",
          dateOfBirth: "14-Jul-1983",
          type: "user",
        });

        const user5 = await this.createUser({
          aadhaarNumber: "567890123456",
          name: "Vikram Patel",
          email: "vikram.patel@example.com",
          phone: "9432109876",
          address: "654, Banjara Hills, Hyderabad - 500034",
          dateOfBirth: "19-Nov-1992",
          type: "user",
        });

        // Create documents for user1 (Rajesh Kumar)
        const user = user1;

        // Create sample documents for the user
        await this.createAadhaar({
          userId: user.id,
          aadhaarNumber: "123456789012",
          name: "Rajesh Kumar",
          fatherName: "Ram Kumar",
          dateOfBirth: "15-Aug-1985",
          gender: "Male",
          address: "123, MG Road, Delhi - 110001",
          phone: "9876543210",
          email: "rajesh@example.com",
          issueDate: "10-Jan-2020",
        });

        await this.createPan({
          userId: user.id,
          panNumber: "ABCDE1234F",
          name: "Rajesh Kumar",
          fatherName: "Ram Kumar",
          dateOfBirth: "15-Aug-1985",
          address: "123, MG Road, Delhi - 110001",
          issueDate: "15-Mar-2018",
        });

        await this.createVoterId({
          userId: user.id,
          voterIdNumber: "ABC1234567",
          name: "Rajesh Kumar",
          fatherName: "Ram Kumar",
          dateOfBirth: "15-Aug-1985",
          gender: "Male",
          address: "123, MG Road, Delhi - 110001",
          constituency: "Delhi Central",
          issueDate: "20-May-2019",
        });

        await this.createDrivingLicense({
          userId: user.id,
          licenseNumber: "DL1420110012345",
          name: "Rajesh Kumar",
          fatherName: "Ram Kumar",
          dateOfBirth: "15-Aug-1985",
          address: "123, MG Road, Delhi - 110001",
          vehicleClass: "LMV, MCWG",
          issueDate: "20-Dec-2020",
          expiryDate: "20-Dec-2028",
        });

        await this.createRationCard({
          userId: user.id,
          rationCardNumber: "RC123456789",
          name: "Rajesh Kumar",
          familyMembers: 4,
          category: "APL",
          address: "123, MG Road, Delhi - 110001",
          issueDate: "10-Apr-2021",
        });

        // Create documents for user2 (Priya Sharma)
        await this.createAadhaar({
          userId: user2.id,
          aadhaarNumber: "234567890123",
          name: "Priya Sharma",
          fatherName: "Suresh Sharma",
          dateOfBirth: "22-Mar-1990",
          gender: "Female",
          address: "456, Sector 15, Gurgaon - 122001",
          phone: "9765432109",
          email: "priya.sharma@example.com",
          issueDate: "15-May-2019",
        });

        await this.createPan({
          userId: user2.id,
          panNumber: "FGHIJ5678K",
          name: "Priya Sharma",
          fatherName: "Suresh Sharma",
          dateOfBirth: "22-Mar-1990",
          address: "456, Sector 15, Gurgaon - 122001",
          issueDate: "10-Aug-2017",
        });

        // Create documents for user3 (Amit Singh)
        await this.createAadhaar({
          userId: user3.id,
          aadhaarNumber: "345678901234",
          name: "Amit Singh",
          fatherName: "Rajendra Singh",
          dateOfBirth: "08-Dec-1987",
          gender: "Male",
          address: "789, Park Street, Kolkata - 700016",
          phone: "9654321098",
          email: "amit.singh@example.com",
          issueDate: "05-Feb-2021",
        });

        await this.createVoterId({
          userId: user3.id,
          voterIdNumber: "KLM3456789",
          name: "Amit Singh",
          fatherName: "Rajendra Singh",
          dateOfBirth: "08-Dec-1987",
          gender: "Male",
          address: "789, Park Street, Kolkata - 700016",
          constituency: "Park Street",
          issueDate: "12-Nov-2019",
        });

        // Create documents for user4 (Sunita Devi)
        await this.createAadhaar({
          userId: user4.id,
          aadhaarNumber: "456789012345",
          name: "Sunita Devi",
          fatherName: "Ramesh Kumar",
          dateOfBirth: "14-Jul-1983",
          gender: "Female",
          address: "321, Civil Lines, Jaipur - 302006",
          phone: "9543210987",
          email: "sunita.devi@example.com",
          issueDate: "28-Jan-2020",
        });

        await this.createRationCard({
          userId: user4.id,
          rationCardNumber: "RC987654321",
          name: "Sunita Devi",
          familyMembers: 5,
          category: "BPL",
          address: "321, Civil Lines, Jaipur - 302006",
          issueDate: "15-Sep-2020",
        });

        // Create documents for user5 (Vikram Patel)
        await this.createAadhaar({
          userId: user5.id,
          aadhaarNumber: "567890123456",
          name: "Vikram Patel",
          fatherName: "Mahesh Patel",
          dateOfBirth: "19-Nov-1992",
          gender: "Male",
          address: "654, Banjara Hills, Hyderabad - 500034",
          phone: "9432109876",
          email: "vikram.patel@example.com",
          issueDate: "03-Jun-2022",
        });

        await this.createDrivingLicense({
          userId: user5.id,
          licenseNumber: "HR0520230012345",
          name: "Vikram Patel",
          fatherName: "Mahesh Patel",
          dateOfBirth: "19-Nov-1992",
          address: "654, Banjara Hills, Hyderabad - 500034",
          vehicleClass: "LMV",
          issueDate: "10-Mar-2023",
          expiryDate: "10-Mar-2031",
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByAadhaar(aadhaarNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.aadhaarNumber, aadhaarNumber)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
    return result[0];
  }

  async getAdminByEmployeeId(employeeId: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.employeeId, employeeId)).limit(1);
    return result[0];
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(insertAdmin).returning();
    return result[0];
  }

  // Document retrieval methods
  async getAadhaarByUserId(userId: number): Promise<AadhaarDocument | undefined> {
    const result = await db.select().from(aadhaarTable).where(eq(aadhaarTable.userId, userId)).limit(1);
    return result[0];
  }

  async getPanByUserId(userId: number): Promise<PanDocument | undefined> {
    const result = await db.select().from(panTable).where(eq(panTable.userId, userId)).limit(1);
    return result[0];
  }

  async getVoterIdByUserId(userId: number): Promise<VoterIdDocument | undefined> {
    const result = await db.select().from(voterIdTable).where(eq(voterIdTable.userId, userId)).limit(1);
    return result[0];
  }

  async getDrivingLicenseByUserId(userId: number): Promise<DrivingLicenseDocument | undefined> {
    const result = await db.select().from(drivingLicenseTable).where(eq(drivingLicenseTable.userId, userId)).limit(1);
    return result[0];
  }

  async getRationCardByUserId(userId: number): Promise<RationCardDocument | undefined> {
    const result = await db.select().from(rationCardTable).where(eq(rationCardTable.userId, userId)).limit(1);
    return result[0];
  }

  // Document creation methods
  async createAadhaar(insertDoc: InsertAadhaarDocument): Promise<AadhaarDocument> {
    const result = await db.insert(aadhaarTable).values(insertDoc).returning();
    return result[0];
  }

  async createPan(insertDoc: InsertPanDocument): Promise<PanDocument> {
    const result = await db.insert(panTable).values(insertDoc).returning();
    return result[0];
  }

  async createVoterId(insertDoc: InsertVoterIdDocument): Promise<VoterIdDocument> {
    const result = await db.insert(voterIdTable).values(insertDoc).returning();
    return result[0];
  }

  async createDrivingLicense(insertDoc: InsertDrivingLicenseDocument): Promise<DrivingLicenseDocument> {
    const result = await db.insert(drivingLicenseTable).values(insertDoc).returning();
    return result[0];
  }

  async createRationCard(insertDoc: InsertRationCardDocument): Promise<RationCardDocument> {
    const result = await db.insert(rationCardTable).values(insertDoc).returning();
    return result[0];
  }

  // Document update methods
  async updateAadhaar(id: number, updates: Partial<AadhaarDocument>): Promise<AadhaarDocument | undefined> {
    const result = await db.update(aadhaarTable)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(aadhaarTable.id, id))
      .returning();
    return result[0];
  }

  async updatePan(id: number, updates: Partial<PanDocument>): Promise<PanDocument | undefined> {
    const result = await db.update(panTable)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(panTable.id, id))
      .returning();
    return result[0];
  }

  async updateVoterId(id: number, updates: Partial<VoterIdDocument>): Promise<VoterIdDocument | undefined> {
    const result = await db.update(voterIdTable)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(voterIdTable.id, id))
      .returning();
    return result[0];
  }

  async updateDrivingLicense(id: number, updates: Partial<DrivingLicenseDocument>): Promise<DrivingLicenseDocument | undefined> {
    const result = await db.update(drivingLicenseTable)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(drivingLicenseTable.id, id))
      .returning();
    return result[0];
  }

  async updateRationCard(id: number, updates: Partial<RationCardDocument>): Promise<RationCardDocument | undefined> {
    const result = await db.update(rationCardTable)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(rationCardTable.id, id))
      .returning();
    return result[0];
  }

  // Change request methods
  async getChangeRequest(id: number): Promise<ChangeRequest | undefined> {
    const result = await db.select().from(changeRequests).where(eq(changeRequests.id, id)).limit(1);
    return result[0];
  }

  async getChangeRequestByReference(referenceId: string): Promise<ChangeRequest | undefined> {
    const result = await db.select().from(changeRequests).where(eq(changeRequests.referenceId, referenceId)).limit(1);
    return result[0];
  }

  async getChangeRequestsByUserId(userId: number): Promise<ChangeRequest[]> {
    return await db.select().from(changeRequests).where(eq(changeRequests.userId, userId));
  }

  async getAllPendingChangeRequests(): Promise<ChangeRequest[]> {
    return await db.select().from(changeRequests).where(eq(changeRequests.status, "pending"));
  }

  async createChangeRequest(insertRequest: InsertChangeRequest): Promise<ChangeRequest> {
    const result = await db.insert(changeRequests).values(insertRequest).returning();
    return result[0];
  }

  async updateChangeRequest(id: number, updates: Partial<ChangeRequest>): Promise<ChangeRequest | undefined> {
    const updateData = { ...updates };
    if (updates.status && updates.status !== "pending") {
      updateData.reviewedAt = new Date();
    }
    
    const result = await db.update(changeRequests)
      .set(updateData)
      .where(eq(changeRequests.id, id))
      .returning();
    return result[0];
  }

  // Field change tracking methods
  async getFieldChangeCount(userId: number, documentType: string, fieldName: string): Promise<number> {
    const result = await db.select()
      .from(fieldChangeTracker)
      .where(and(
        eq(fieldChangeTracker.userId, userId),
        eq(fieldChangeTracker.documentType, documentType),
        eq(fieldChangeTracker.fieldName, fieldName)
      ))
      .limit(1);
    
    return result[0]?.changeCount || 0;
  }

  async incrementFieldChangeCount(userId: number, documentType: string, fieldName: string): Promise<void> {
    const existing = await db.select()
      .from(fieldChangeTracker)
      .where(and(
        eq(fieldChangeTracker.userId, userId),
        eq(fieldChangeTracker.documentType, documentType),
        eq(fieldChangeTracker.fieldName, fieldName)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(fieldChangeTracker)
        .set({ 
          changeCount: existing[0].changeCount + 1,
          lastChanged: new Date()
        })
        .where(eq(fieldChangeTracker.id, existing[0].id));
    } else {
      await db.insert(fieldChangeTracker).values({
        userId,
        documentType,
        fieldName,
        changeCount: 1
      });
    }
  }

  async canMakeMinorChange(userId: number, documentType: string, fieldName: string): Promise<boolean> {
    const changeCount = await this.getFieldChangeCount(userId, documentType, fieldName);
    return changeCount < 2; // Allow up to 2 changes per field
  }
}

export const storage = new DatabaseStorage();