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

    let transactions = await prisma.transaction.findMany({
      where: { userId: payload.userId },
      orderBy: { date: "desc" },
    });

    // If user has no explicit transactions yet, but has investments, create initial BUY records
    if (transactions.length === 0) {
      const investments = await prisma.investment.findMany({
        where: { userId: payload.userId },
        orderBy: { purchaseDate: "desc" },
      });

      if (investments.length > 0) {
        await prisma.$transaction(
          investments.map((inv) =>
            prisma.transaction.create({
              data: {
                type: "BUY",
                assetName: inv.assetName,
                category: inv.category,
                amount: inv.amount,
                status: "COMPLETED",
                date: inv.purchaseDate,
                notes: `Initial asset acquisition of ${inv.assetName}`,
                userId: payload.userId,
              },
            })
          )
        );

        transactions = await prisma.transaction.findMany({
          where: { userId: payload.userId },
          orderBy: { date: "desc" },
        });
      }
    }

    // Inflow: DEPOSIT, SELL, DIVIDEND
    const totalInflow = transactions
      .filter((t) => ["DEPOSIT", "SELL", "DIVIDEND"].includes(t.type))
      .reduce((acc, t) => acc + t.amount, 0);

    // Outflow: BUY, WITHDRAWAL
    const totalOutflow = transactions
      .filter((t) => ["BUY", "WITHDRAWAL"].includes(t.type))
      .reduce((acc, t) => acc + t.amount, 0);

    const netVolume = totalInflow - totalOutflow;

    return NextResponse.json({
      success: true,
      transactions,
      summary: {
        totalInflow,
        totalOutflow,
        netVolume,
        totalCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { type, assetName, category, amount, date, notes, status } = body;

    if (!type || !assetName || amount === undefined) {
      return NextResponse.json(
        { success: false, message: "Please provide type, asset name, and amount." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    const validTypes = ["BUY", "SELL", "DEPOSIT", "WITHDRAWAL", "DIVIDEND"];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: `Type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: type.toUpperCase(),
        assetName: assetName.trim(),
        category: category?.trim() || "Other",
        amount: numAmount,
        status: status?.toUpperCase() || "COMPLETED",
        date: date ? new Date(date) : new Date(),
        notes: notes?.trim() || null,
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction recorded successfully.",
      transaction,
    }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record transaction." },
      { status: 500 }
    );
  }
}
