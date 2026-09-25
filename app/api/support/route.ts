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

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

    return NextResponse.json({
      success: true,
      tickets,
      summary: {
        totalTickets: tickets.length,
        openCount,
        resolvedCount,
      },
    });
  } catch (error) {
    console.error("Fetch support tickets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch support tickets." },
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
    const { subject, category, priority, message } = body;

    if (!subject || !category || !message) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields (subject, category, message)." },
        { status: 400 }
      );
    }

    const ticketNumber = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: subject.trim(),
        category: category.trim(),
        priority: priority?.toUpperCase() || "MEDIUM",
        status: "OPEN",
        message: message.trim(),
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket #${ticketNumber} created successfully! Our team will respond shortly.`,
      ticket,
    }, { status: 201 });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create support ticket." },
      { status: 500 }
    );
  }
}
