import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const ROLES = ["USER", "ADMIN", "SUPERADMIN"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentAdmin, error } = await requireAdmin();

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
        { success: false, message: "Role must be USER, ADMIN, or SUPERADMIN." },
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

    // Protection: User cannot demote their own account
    if (id === currentAdmin.id && role !== currentAdmin.role) {
      return NextResponse.json(
        { success: false, message: "You cannot change your own administrative role." },
        { status: 400 }
      );
    }

    // Role hierarchy guards for standard ADMIN
    if (currentAdmin.role === "ADMIN") {
      // ADMIN cannot promote anyone to SUPERADMIN
      if (role === "SUPERADMIN") {
        return NextResponse.json(
          { success: false, message: "Only Superadmins can promote users to Superadmin." },
          { status: 403 }
        );
      }

      // ADMIN cannot modify an existing ADMIN or SUPERADMIN
      if (target.role === "ADMIN" || target.role === "SUPERADMIN") {
        return NextResponse.json(
          { success: false, message: "Only Superadmins can modify Administrator accounts." },
          { status: 403 }
        );
      }
    }

    // If target is SUPERADMIN and caller is not SUPERADMIN
    if (target.role === "SUPERADMIN" && currentAdmin.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Only a Superadmin can modify a Superadmin account." },
        { status: 403 }
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
    const { user: currentAdmin, error } = await requireAdmin();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const { id } = await params;

    if (id === currentAdmin.id) {
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

    // Role hierarchy guards
    if (currentAdmin.role === "ADMIN") {
      // Standard ADMIN cannot delete other ADMIN or SUPERADMIN
      if (target.role === "ADMIN" || target.role === "SUPERADMIN") {
        return NextResponse.json(
          { success: false, message: "Only Superadmins can delete Administrator accounts." },
          { status: 403 }
        );
      }
    }

    // Protection: Only SUPERADMIN can delete another SUPERADMIN
    if (target.role === "SUPERADMIN" && currentAdmin.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Only Superadmins can delete a Superadmin account." },
        { status: 403 }
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
