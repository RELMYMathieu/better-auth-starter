import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAccountDeleted } from "@/utils/audit-logger";
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
    const { confirmText } = body;

    if (confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Please type 'DELETE MY ACCOUNT' to confirm" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.delete(userTable).where(eq(userTable.id, userId));

    await logAccountDeleted({
      userId,
      userEmail,
      deletedBy: "self",
      ipAddress,
      userAgent,
    });

    try {
      await sendEmail({
        to: userEmail,
        subject: "Account deleted",
        text: "Your account has been successfully deleted. All your data has been removed from our systems.\n\nIf you didn't request this deletion, please contact support immediately.",
      });
    } catch (emailError) {
      console.error("Failed to send deletion confirmation:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
