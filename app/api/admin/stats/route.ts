import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const { user: admin, error } = await requireAdmin();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    const [users, investments] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.investment.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    const totalInvested = investments.reduce((acc, item) => acc + item.amount, 0);
    const totalCurrentValue = investments.reduce((acc, item) => acc + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;

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

    const perUser: Record<
      string,
      {
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        investmentCount: number;
        totalInvested: number;
        totalCurrentValue: number;
        totalProfitLoss: number;
      }
    > = {};

    users.forEach((item) => {
      perUser[item.id] = {
        ...item,
        investmentCount: 0,
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
      };
    });

    investments.forEach((item) => {
      const entry = perUser[item.userId];
      if (!entry) return;
      entry.investmentCount += 1;
      entry.totalInvested += item.amount;
      entry.totalCurrentValue += item.currentValue;
      entry.totalProfitLoss += item.profitLoss;
    });

    const userStats = Object.values(perUser).map((item) => ({
      ...item,
      roiPercentage:
        item.totalInvested > 0 ? (item.totalProfitLoss / item.totalInvested) * 100 : 0,
    }));

    const topInvestors = [...userStats]
      .sort((a, b) => b.totalCurrentValue - a.totalCurrentValue)
      .slice(0, 5);

    const recentInvestments = investments.slice(0, 8).map((item) => ({
      id: item.id,
      assetName: item.assetName,
      category: item.category,
      amount: item.amount,
      currentValue: item.currentValue,
      profitLoss: item.profitLoss,
      purchaseDate: item.purchaseDate,
      user: item.user,
    }));

    return NextResponse.json({
      success: true,
      admin,
      summary: {
        totalUsers: users.length,
        totalAdmins: users.filter((item) => item.role === "ADMIN").length,
        totalInvestments: investments.length,
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        roiPercentage: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
      },
      categoryBreakdown,
      userStats,
      topInvestors,
      recentInvestments,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin statistics." },
      { status: 500 }
    );
  }
}
