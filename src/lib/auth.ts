import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const sessionCookieName = "bug_tracker_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.DATABASE_URL;

  if (!secret) {
    throw new Error("AUTH_SECRET or DATABASE_URL must be set.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function hashToken(token: string) {
  return createHmac("sha256", getAuthSecret())
    .update(`session:${token}`)
    .digest("hex");
}

function buildCookieValue(token: string) {
  return `${token}.${sign(token)}`;
}

function readCookieValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [token, signature] = value.split(".");

  if (!token || !signature) {
    return null;
  }

  const expectedSignature = sign(token);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return token;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, buildCookieValue(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = readCookieValue(cookieStore.get(sessionCookieName)?.value);

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = readCookieValue(cookieStore.get(sessionCookieName)?.value);

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(sessionCookieName);
}
