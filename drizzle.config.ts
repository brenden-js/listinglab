import {type Config} from "drizzle-kit";

export default {
  schema: "./src/app/api/trpc/db/schema.ts",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  },
  dialect: "sqlite"
} satisfies Config;
