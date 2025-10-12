import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { logPasswordChange } from "@/utils/audit-logger";
import { sendEmail } from "@/lib/email";

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

    // Use Better Auth's password change API
    try {
      await auth.api.changePassword({
        body: {
          newPassword,
          currentPassword,
        },
        headers: await headers(),
      });
    } catch (error: any) {
      // Better Auth will throw if current password is wrong
      return NextResponse.json(
        { error: error.message || "Current password is incorrect" },
        { status: 400 }
      );
    }

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
