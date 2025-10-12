import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

interface ParsedSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  deviceInfo: {
    device: string;
    browser: string;
    os: string;
  };
}

function parseUserAgent(ua: string | null): {
  device: string;
  browser: string;
  os: string;
} {
  const defaultResult = { 
    device: "Unknown Device", 
    browser: "Unknown Browser", 
    os: "Unknown OS" 
  };

  if (!ua) {
    return defaultResult;
  }

  try {
    const parser = new UAParser();
    parser.setUA(ua);
    const result = parser.getResult();

    // Get device type with fallback
    const deviceType = result.device.type || "desktop";
    
    // Map device types
    const deviceMap: Record<string, string> = {
      "mobile": "Mobile",
      "tablet": "Tablet",
      "desktop": "Desktop",
      "smarttv": "Smart TV",
      "wearable": "Wearable",
      "console": "Console",
      "embedded": "Embedded",
      "xr": "XR"
    };
    const device = deviceMap[deviceType] || "Desktop";

    // Get browser with version
    const browserName = result.browser.name || "Unknown Browser";
    const browserVersion = result.browser.major || "";
    const browser = browserVersion 
      ? `${browserName} ${browserVersion}` 
      : browserName;

    // Get OS with version
    const osName = result.os.name || "Unknown OS";
    const osVersion = result.os.version || "";
    const os = osVersion 
      ? `${osName} ${osVersion}` 
      : osName;

    return { device, browser, os };
  } catch (error) {
    console.error("[Sessions] Error parsing user agent:", error);
    return defaultResult;
  }
}

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
      .orderBy(desc(sessionTable.updatedAt));

    // Parse user agents and enrich session data
    const sessionsWithParsedUA: ParsedSession[] = sessions.map((session) => {
      const deviceInfo = parseUserAgent(session.userAgent);

      return {
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        isCurrent: session.id === currentSession.session.id,
        deviceInfo,
      };
    });

    return NextResponse.json(sessionsWithParsedUA);
  } catch (error) {
    console.error("[Sessions] Error fetching user sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
