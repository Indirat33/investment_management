import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      users,
    });
  } catch (error: any) {
    console.error("Database connection test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}