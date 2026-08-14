import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    let passwordMatch = false;

    // Check if password is already bcrypt hashed
    if (user.password.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(
        password,
        user.password
      );
    } else {
      // Support users created before bcrypt was added
      passwordMatch = password === user.password;

      // Convert old plain-text password to bcrypt
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(
          password,
          10
        );

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
          },
        });
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create login session
    const session = await createSession(user.id);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // Store session in HTTP-only cookie
    response.cookies.set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}