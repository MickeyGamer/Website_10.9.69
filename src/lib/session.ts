import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 1 วัน
const COOKIE_NAME = "session";

if (!process.env.JWT_SECRET) {
  throw new Error("กรุณาใส่ค่า JWT_SECRET ในไฟล์ .env.local");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  school?: string;
  [key: string]: unknown;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[session] verify failed:", err);
    }
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireRole(
  role: SessionPayload["role"]
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== role) return null;
  return session;
}