import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
  throw new Error("AUTH_SECRET is not defined in .env");
}

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