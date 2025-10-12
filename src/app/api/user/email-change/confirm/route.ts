import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailChangeRequest, user } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { logAuditEvent } from "@/utils/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const [changeRequest] = await db
      .select()
      .from(emailChangeRequest)
      .where(
        and(
          eq(emailChangeRequest.token, token),
          gt(emailChangeRequest.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, changeRequest.newEmail),
    });

    if (existingUser) {
      await db.delete(emailChangeRequest).where(eq(emailChangeRequest.id, changeRequest.id));
      
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    await db
      .update(user)
      .set({ 
        email: changeRequest.newEmail,
        updatedAt: new Date(),
      })
      .where(eq(user.id, changeRequest.userId));

    await db.delete(emailChangeRequest).where(eq(emailChangeRequest.id, changeRequest.id));

    await sendEmail({
      to: changeRequest.currentEmail,
      subject: "Email address changed",
      text: `Your email address has been successfully changed to ${changeRequest.newEmail}.\n\nIf you didn't make this change, please contact support immediately.`,
    });

    await logAuditEvent({
      eventType: "EMAIL_CHANGE_COMPLETE",
      category: "USER",
      severity: "INFO",
      description: `Email changed from ${changeRequest.currentEmail} to ${changeRequest.newEmail}`,
      success: true,
      userId: changeRequest.userId,
      userEmail: changeRequest.newEmail,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      metadata: { 
        oldEmail: changeRequest.currentEmail,
        newEmail: changeRequest.newEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email address updated successfully",
    });
  } catch (error) {
    console.error("Email change confirm error:", error);
    return NextResponse.json(
      { error: "Failed to confirm email change" },
      { status: 500 }
    );
  }
}
