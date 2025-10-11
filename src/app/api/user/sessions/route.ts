import { NextRequest, NextResponse } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

function parseUserAgentString(ua: string | null): {
  device: string;
  browser: string;
  os: string;
} {
  if (!ua) {
    return { device: "Unknown", browser: "Unknown", os: "Unknown" };
  }

  // Parse device type
  let device = "Desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "Mobile";
  }

  // Parse browser
  let browser = "Unknown";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome|chromium|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/trident/i.test(ua) || /msie/i.test(ua)) {
    browser = "Internet Explorer";
  }

  // Parse OS
  let os = "Unknown";
  if (/windows nt 10/i.test(ua)) {
    os = "Windows 10/11";
  } else if (/windows nt 6.3/i.test(ua)) {
    os = "Windows 8.1";
  } else if (/windows nt 6.2/i.test(ua)) {
    os = "Windows 8";
  } else if (/windows nt 6.1/i.test(ua)) {
    os = "Windows 7";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    const macVersion = ua.match(/mac os x (\d+)[._](\d+)/i);
    if (macVersion) {
      os = `macOS ${macVersion[1]}.${macVersion[2]}`;
    } else {
      os = "macOS";
    }
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    const iosVersion = ua.match(/os (\d+)[._](\d+)/i);
    if (iosVersion) {
      os = `iOS ${iosVersion[1]}.${iosVersion[2]}`;
    } else {
      os = "iOS";
    }
  } else if (/android/i.test(ua)) {
    const androidVersion = ua.match(/android (\d+(\.\d+)?)/i);
    if (androidVersion) {
      os = `Android ${androidVersion[1]}`;
    } else {
      os = "Android";
    }
  } else if (/linux/i.test(ua)) {
    if (/ubuntu/i.test(ua)) {
      os = "Ubuntu";
    } else if (/debian/i.test(ua)) {
      os = "Debian";
    } else if (/fedora/i.test(ua)) {
      os = "Fedora";
    } else {
      os = "Linux";
    }
  } else if (/cros/i.test(ua)) {
    os = "Chrome OS";
  }

  return { device, browser, os };
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
      const deviceInfo = parseUserAgentString(session.userAgent);

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
    console.error("Error fetching user sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
