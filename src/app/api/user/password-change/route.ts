import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logPasswordChange } from "@/utils/audit-logger";
import { sendEmail } from "@/lib/email";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Get the user's credential account
    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    if (!credentialAccount || !credentialAccount.password) {
      return NextResponse.json(
        { error: "No password account found. You may be using OAuth." },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      currentPassword,
      credentialAccount.password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, credentialAccount.id));

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await logPasswordChange({
      userId: session.user.id,
      userEmail: session.user.email,
      ipAddress,
      userAgent,
      sessionId: session.session.id,
    });

    try {
      await sendEmail({
        to: session.user.email,
        subject: "Password changed",
        text: `Your password was successfully changed.\n\nIf you didn't make this change, please contact support immediately and secure your account.`,
      });
    } catch (emailError) {
      console.error("Failed to send password change notification:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
