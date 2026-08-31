import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let rawUrl = (process.env.DATABASE_URL || "").trim();

// Remove quotes if present
rawUrl = rawUrl.replace(/^["']|["']$/g, "").trim();

// Remove prefix if DATABASE_URL= was pasted inside the value
if (rawUrl.startsWith("DATABASE_URL=")) {
  rawUrl = rawUrl.replace(/^DATABASE_URL=/, "").trim().replace(/^["']|["']$/g, "").trim();
}

const connectionString =
  rawUrl ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}