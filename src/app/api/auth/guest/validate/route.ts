import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionCode } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Validate code
    const [codeRecord] = await db
      .select()
      .from(sessionCode)
      .where(eq(sessionCode.code, code.toUpperCase()));

    if (!codeRecord) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (codeRecord.used) {
      return NextResponse.json({ error: "Code already used" }, { status: 400 });
    }

    if (new Date() > codeRecord.expiresAt) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      codeId: codeRecord.id,
      code: codeRecord.code,
    });

  } catch (error) {
    console.error("Error validating session code:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
