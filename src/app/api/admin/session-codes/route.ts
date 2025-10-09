import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionCode } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc } from "drizzle-orm";

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { expiresInHours } = body;

    if (!expiresInHours || expiresInHours <= 0) {
      return NextResponse.json(
        { error: "Invalid expiration time" },
        { status: 400 }
      );
    }

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const [newCode] = await db
      .insert(sessionCode)
      .values({
        id: crypto.randomUUID(),
        code,
        expiresAt,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(newCode);
  } catch (error) {
    console.error("Error creating session code:", error);
    return NextResponse.json(
      { error: "Failed to create session code" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const codes = await db.query.sessionCode.findMany({
      orderBy: [desc(sessionCode.createdAt)],
      with: {
        createdBy: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Error fetching session codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch session codes" },
      { status: 500 }
    );
  }
}
