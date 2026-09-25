import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    const payload = await verifySession(session);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    if (transaction.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this transaction." },
        { status: 403 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete transaction." },
      { status: 500 }
    );
  }
}
