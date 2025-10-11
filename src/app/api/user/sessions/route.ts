import { NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const currentSession = (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;

    if (!currentSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.userId, currentSession.user.id))
      .orderBy(desc(sessionTable.updatedAt));

    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSession.session.id,
    }));

    return NextResponse.json(sessionsWithCurrent);
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
