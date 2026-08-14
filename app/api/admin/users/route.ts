import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const { error } = await requireAdmin();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { investments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users: users.map(({ _count, ...user }) => ({
        ...user,
        investmentCount: _count.investments,
      })),
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
