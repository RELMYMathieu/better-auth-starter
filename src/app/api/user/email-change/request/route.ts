import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { emailChangeRequest, user } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { logAuditEvent } from "@/utils/audit-logger";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, newEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const existingRequest = await db.query.emailChangeRequest.findFirst({
      where: and(
        eq(emailChangeRequest.userId, session.user.id),
        gt(emailChangeRequest.expiresAt, new Date())
      ),
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending email change request" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(emailChangeRequest).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      currentEmail: session.user.email,
      newEmail,
      token,
      expiresAt,
    });

    const confirmUrl = `${process.env.BETTER_AUTH_URL}/auth/email-change/confirm?token=${token}`;
    
    await sendEmail({
      to: newEmail,
      subject: "Confirm your email change",
      text: `You requested to change your email address. Click the link below to confirm:\n\n${confirmUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this change, please ignore this email.`,
    });

    await sendEmail({
      to: session.user.email,
      subject: "Email change requested",
      text: `A request was made to change your email address to ${newEmail}.\n\nIf you didn't make this request, please secure your account immediately.`,
    });

    await logAuditEvent({
      eventType: "EMAIL_CHANGE_REQUEST",
      category: "USER",
      severity: "INFO",
      description: `User requested email change from ${session.user.email} to ${newEmail}`,
      success: true,
      userId: session.user.id,
      userEmail: session.user.email,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      metadata: { newEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent to new address",
    });
  } catch (error) {
    console.error("Email change request error:", error);
    return NextResponse.json(
      { error: "Failed to process email change request" },
      { status: 500 }
    );
  }
}
