import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
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

    const investments = await prisma.investment.findMany({
      where: { userId: payload.userId },
      orderBy: { purchaseDate: "desc" },
    });

    const totalInvested = investments.reduce((acc, item) => acc + item.amount, 0);
    const totalCurrentValue = investments.reduce((acc, item) => acc + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const roiPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return NextResponse.json({
      success: true,
      investments,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        roiPercentage,
        totalCount: investments.length,
      },
    });
  } catch (error) {
    console.error("Fetch investments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch investments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // Verify session
    const payload = await verifySession(session);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // Get form data
    const body = await request.json();

    const {
      assetName,
      category,
      amount,
      purchaseDate,
      currentValue,
    } = body;

    // Validate fields
    if (
      !assetName ||
      !category ||
      amount === undefined ||
      !purchaseDate ||
      currentValue === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all fields.",
        },
        { status: 400 }
      );
    }

    // Convert numbers
    const investmentAmount = Number(amount);
    const investmentCurrentValue = Number(currentValue);

    // Validate numbers
    if (
      Number.isNaN(investmentAmount) ||
      Number.isNaN(investmentCurrentValue)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount and current value must be valid numbers.",
        },
        { status: 400 }
      );
    }

    if (investmentAmount < 0 || investmentCurrentValue < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount cannot be negative.",
        },
        { status: 400 }
      );
    }

    // Calculate profit/loss
    const profitLoss =
      investmentCurrentValue - investmentAmount;

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        assetName: assetName.trim(),
        category: category.trim(),
        amount: investmentAmount,
        purchaseDate: new Date(purchaseDate),
        currentValue: investmentCurrentValue,
        profitLoss,
        userId: payload.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Investment added successfully.",
        investment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create investment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the investment.",
      },
      { status: 500 }
    );
  }
}