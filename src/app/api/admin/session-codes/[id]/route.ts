import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionCode } from "@/db/schema";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    }) as Session | null;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.delete(sessionCode).where(eq(sessionCode.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session code:", error);
    return NextResponse.json(
      { error: "Failed to delete session code" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    }) as Session | null;

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db
      .update(sessionCode)
      .set({ used: true, usedAt: new Date() })
      .where(eq(sessionCode.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error invalidating session code:", error);
    return NextResponse.json(
      { error: "Failed to invalidate session code" },
      { status: 500 }
    );
  }
}
