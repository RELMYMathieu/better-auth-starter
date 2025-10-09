import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionCode, user, session } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const [codeRecord] = await db
      .select()
      .from(sessionCode)
      .where(eq(sessionCode.code, code.toUpperCase()));

    if (!codeRecord) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (codeRecord.used) {
      return NextResponse.json(
        { error: "Code already used" },
        { status: 400 }
      );
    }

    if (new Date() > codeRecord.expiresAt) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const guestName = `Guest_${code}`;
    const guestEmail = `guest_${code.toLowerCase()}@temp.local`;

    const [guestUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: guestName,
        email: guestEmail,
        emailVerified: true,
        role: "user",
      })
      .returning();

    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(session).values({
      id: sessionId,
      userId: guestUser.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db
      .update(sessionCode)
      .set({
        used: true,
        usedAt: new Date(),
        usedBySessionId: sessionId,
      })
      .where(eq(sessionCode.id, codeRecord.id));

    // Create response and set cookie on it
    const response = NextResponse.json({
      success: true,
      user: { id: guestUser.id, name: guestUser.name },
    });

    // Set the session cookie on the response
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error validating session code:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
