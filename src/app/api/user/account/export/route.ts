import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user as userTable, account, session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: NextRequest) {
  try {
    const session = (await auth.api.getSession({
      headers: await headers(),
    })) as Session | null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    const userAccounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, session.user.id));

    const userSessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.userId, session.user.id));

    const dataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        emailVerified: userData.emailVerified,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        image: userData.image,
      },
      accounts: userAccounts.map((acc) => ({
        provider: acc.providerId,
        accountId: acc.accountId,
        createdAt: acc.createdAt,
      })),
      sessions: userSessions.map((sess) => ({
        id: sess.id,
        ipAddress: sess.ipAddress,
        userAgent: sess.userAgent,
        createdAt: sess.createdAt,
        updatedAt: sess.updatedAt,
      })),
    };

    return new NextResponse(JSON.stringify(dataExport, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="account-data-${session.user.id}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
