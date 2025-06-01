import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";

// Initialize SQLite database
const sqlite = new Database(join(process.cwd(), "data.db"));

// Create drizzle database instance
export const db = drizzle(sqlite);
