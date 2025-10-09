import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionCode } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codeId } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    await db
      .update(sessionCode)
      .set({
        used: true,
        usedAt: new Date(),
        usedBySessionId: session.session.id,
      })
      .where(eq(sessionCode.id, codeId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error marking code as used:", error);
    return NextResponse.json(
      { error: "Failed to process" },
      { status: 500 }
    );
  }
}
