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
      orderBy: { currentValue: "desc" },
    });

    const totalInvested = investments.reduce((acc, item) => acc + item.amount, 0);
    const totalCurrentValue = investments.reduce((acc, item) => acc + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;

    // Group by category
    const categoryMap: Record<
      string,
      { category: string; amount: number; currentValue: number; profitLoss: number; count: number }
    > = {};

    investments.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = {
          category: item.category,
          amount: 0,
          currentValue: 0,
          profitLoss: 0,
          count: 0,
        };
      }
      categoryMap[item.category].amount += item.amount;
      categoryMap[item.category].currentValue += item.currentValue;
      categoryMap[item.category].profitLoss += item.profitLoss;
      categoryMap[item.category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
      ...cat,
      percentage: totalCurrentValue > 0 ? (cat.currentValue / totalCurrentValue) * 100 : 0,
      roiPercentage: cat.amount > 0 ? (cat.profitLoss / cat.amount) * 100 : 0,
    }));

    // Top performers (top 3 by profitLoss)
    const topPerformers = [...investments]
      .sort((a, b) => b.profitLoss - a.profitLoss)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        roiPercentage: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
        totalCount: investments.length,
      },
      categoryBreakdown,
      topPerformers,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
