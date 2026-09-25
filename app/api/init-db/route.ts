import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Create User table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create User email unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    // Create Investment table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Investment" (
          "id" TEXT NOT NULL,
          "assetName" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "purchaseDate" TIMESTAMP(3) NOT NULL,
          "currentValue" DOUBLE PRECISION NOT NULL,
          "profitLoss" DOUBLE PRECISION NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create Transaction table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
          "id" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "assetName" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'Other',
          "amount" DOUBLE PRECISION NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'COMPLETED',
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "notes" TEXT,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create SupportTicket table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportTicket" (
          "id" TEXT NOT NULL,
          "ticketNumber" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
          "status" TEXT NOT NULL DEFAULT 'OPEN',
          "message" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");
    `);

    return NextResponse.json({
      success: true,
      message: "Cloud database tables (User, Investment, Transaction, SupportTicket) created successfully!",
    });
  } catch (error: any) {
    console.error("Init DB Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize tables",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
