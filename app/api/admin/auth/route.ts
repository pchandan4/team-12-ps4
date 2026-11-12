import { NextResponse } from "next/server";
import { z } from "zod";
import { isUserAdmin, getExpectedAdminHash, ADMIN_COOKIE } from "@/lib/adminAuth";
import { ADMIN_PASSCODE } from "@/lib/env";

export const runtime = "nodejs";

const adminLoginSchema = z.object({
  passcode: z.string().min(1).max(100),
});

/**
 * GET /api/admin/auth
 * Checks whether the client has an active authorized admin session.
 */
export async function GET() {
  const isAdmin = await isUserAdmin();
  return NextResponse.json({ isAdmin });
}

/**
 * POST /api/admin/auth
 * Verifies admin passcode and sets an HTTP-only admin session cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid admin passcode format" }, { status: 400 });
    }

    if (parsed.data.passcode.trim() !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: "Incorrect administrator passcode" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, isAdmin: true });
    const hash = await getExpectedAdminHash();

    response.cookies.set(ADMIN_COOKIE, hash, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/auth
 * Clears administrator session.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true, isAdmin: false });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

