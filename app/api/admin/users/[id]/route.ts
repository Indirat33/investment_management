import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const ROLES = ["USER", "ADMIN"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin, error } = await requireAdmin();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be USER or ADMIN." },
        { status: 400 }
      );
    }

    if (id === admin.id && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "You cannot remove your own admin access." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role}.`,
      user,
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin, error } = await requireAdmin();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "User and their investments deleted.",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user." },
      { status: 500 }
    );
  }
}
