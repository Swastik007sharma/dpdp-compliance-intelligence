import { betterAuth } from "better-auth";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const connectionString = (process.env.DATABASE_URL || "").replace(
  /([?&])sslmode=[^&]*(&|$)/,
  (_, prefix, suffix) => (prefix === "?" && suffix === "&" ? "?" : "")
);

export const auth = betterAuth({
  database: new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string" as const,
        required: false,
        defaultValue: "Department User",
        input: false,
      },
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});