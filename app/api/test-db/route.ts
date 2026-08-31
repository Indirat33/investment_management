import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT_SET";
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");

    const users = await prisma.user.findMany();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      dbUrlSample: maskedUrl,
      users,
    });
  } catch (error: any) {
    console.error("Database connection test error:", error);
    const dbUrl = process.env.DATABASE_URL || "NOT_SET";
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        dbUrlSample: maskedUrl,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}