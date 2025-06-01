import { defineConfig } from "drizzle-kit";
import { join } from "path";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: join(process.cwd(), "data.db")
  },
});
