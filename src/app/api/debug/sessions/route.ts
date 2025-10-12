import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
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
      .limit(3);

    const debugInfo = sessions.map(session => ({
      id: session.id.substring(0, 10) + "...",
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      userAgentIsNull: session.userAgent === null,
      userAgentLength: session.userAgent?.length || 0,
      ipIsNull: session.ipAddress === null,
      createdAt: session.createdAt,
    }));

    return NextResponse.json({
      message: "Raw session data from database",
      currentSessionId: currentSession.session.id.substring(0, 10) + "...",
      sessions: debugInfo,
      requestHeaders: {
        userAgent: _request.headers.get("user-agent"),
        forwarded: _request.headers.get("x-forwarded-for"),
        realIp: _request.headers.get("x-real-ip"),
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
