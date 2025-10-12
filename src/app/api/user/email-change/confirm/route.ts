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

    // Find the change request
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

    // Check if email is already in use
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, changeRequest.newEmail),
    });

    if (existingUser) {
      // Clean up the request
      await db.delete(emailChangeRequest).where(eq(emailChangeRequest.id, changeRequest.id));
      
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Update the user's email
    await db
      .update(user)
      .set({ 
        email: changeRequest.newEmail,
        updatedAt: new Date(),
      })
      .where(eq(user.id, changeRequest.userId));

    // Delete the used request
    await db.delete(emailChangeRequest).where(eq(emailChangeRequest.id, changeRequest.id));

    // Delete all other pending requests for this user
    await db
      .delete(emailChangeRequest)
      .where(eq(emailChangeRequest.userId, changeRequest.userId));

    // Send confirmation to old email
    try {
      await sendEmail({
        to: changeRequest.currentEmail,
        subject: "Email address changed",
        text: `Your email address has been successfully changed to ${changeRequest.newEmail}.\n\nIf you didn't make this change, please contact support immediately.`,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation to old email:", emailError);
    }

    // Send welcome to new email
    try {
      await sendEmail({
        to: changeRequest.newEmail,
        subject: "Email address updated",
        text: `Your email address has been successfully updated.\n\nYou can now use ${changeRequest.newEmail} to log in to your account.`,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation to new email:", emailError);
    }

    // Log the change
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
