// Vercel deployment trigger
import { SignJWT, jwtVerify } from "jose";

const secretKey =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "default_super_secret_investment_key_2026";

const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);

    return payload as { userId: string };
  } catch {
    return null;
  }
}