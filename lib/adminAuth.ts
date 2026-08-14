import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AdminCheck =
  | { user: AdminUser; error: null }
  | { user: null; error: { message: string; status: number } };

export async function requireAdmin(): Promise<AdminCheck> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return { user: null, error: { message: "You must be logged in.", status: 401 } };
  }

  const payload = await verifySession(session);
  if (!payload) {
    return { user: null, error: { message: "Invalid or expired session.", status: 401 } };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return { user: null, error: { message: "User not found.", status: 404 } };
  }

  if (user.role !== "ADMIN") {
    return { user: null, error: { message: "Admin access required.", status: 403 } };
  }

  return { user, error: null };
}
