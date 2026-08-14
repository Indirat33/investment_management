import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// GET single investment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { success: false, message: "Investment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      investment,
    });
  } catch (error) {
    console.error("Get investment by id error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch investment details." },
      { status: 500 }
    );
  }
}

// PUT / EDIT investment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check ownership
    const existing = await prisma.investment.findFirst({
      where: { id, userId: payload.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Investment not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { assetName, category, amount, purchaseDate, currentValue } = body;

    const investmentAmount = amount !== undefined ? Number(amount) : existing.amount;
    const investmentCurrentValue = currentValue !== undefined ? Number(currentValue) : existing.currentValue;

    if (Number.isNaN(investmentAmount) || Number.isNaN(investmentCurrentValue)) {
      return NextResponse.json(
        { success: false, message: "Amount and Current Value must be valid numbers." },
        { status: 400 }
      );
    }

    const profitLoss = investmentCurrentValue - investmentAmount;

    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        assetName: assetName !== undefined ? assetName.trim() : existing.assetName,
        category: category !== undefined ? category.trim() : existing.category,
        amount: investmentAmount,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existing.purchaseDate,
        currentValue: investmentCurrentValue,
        profitLoss,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Investment updated successfully.",
      investment: updatedInvestment,
    });
  } catch (error) {
    console.error("Update investment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update investment." },
      { status: 500 }
    );
  }
}

// DELETE investment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existing = await prisma.investment.findFirst({
      where: { id, userId: payload.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Investment not found." },
        { status: 404 }
      );
    }

    await prisma.investment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Investment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete investment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete investment." },
      { status: 500 }
    );
  }
}
