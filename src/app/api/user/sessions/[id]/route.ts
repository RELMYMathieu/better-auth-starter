import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentSession = (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;

    if (!currentSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id === currentSession.session.id) {
      return NextResponse.json(
        { error: "Cannot revoke current session. Use logout instead." },
        { status: 400 }
      );
    }

    const [targetSession] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, id))
      .limit(1);

    if (!targetSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (targetSession.userId !== currentSession.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to revoke this session" },
        { status: 403 }
      );
    }

    await db
      .delete(sessionTable)
      .where(
        and(
          eq(sessionTable.id, id),
          eq(sessionTable.userId, currentSession.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking session:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}
