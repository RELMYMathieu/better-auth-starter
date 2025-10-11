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
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "Mobile";
  }

  // Parse browser - ORDER MATTERS! Check most specific first
  let browser = "Unknown";
  
  // Check for Edge first (contains both "Edg" and "Chrome")
  if (/edg(?:e|a|ios)?\//i.test(ua)) {
    browser = "Edge";
  }
  // Check for Opera (contains "OPR" or "Opera")
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browser = "Opera";
  }
  // Check for Samsung Browser
  else if (/samsungbrowser\//i.test(ua)) {
    browser = "Samsung Browser";
  }
  // Check for UC Browser
  else if (/ucbrowser|ucweb/i.test(ua)) {
    browser = "UC Browser";
  }
  // Check for Chrome (must come after Edge check)
  else if (/chrome|chromium|crios/i.test(ua)) {
    browser = "Chrome";
  }
  // Check for Safari (must come after Chrome check since Chrome includes "Safari")
  else if (/safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua)) {
    browser = "Safari";
  }
  // Check for Firefox
  else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  }
  // Check for IE/Legacy Edge
  else if (/trident|msie|edge\/[0-9]/i.test(ua)) {
    browser = "Internet Explorer";
  }

  // Parse OS with better version detection
  let os = "Unknown";
  
  // Windows
  if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows 10/11";
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = "Windows 8.1";
  } else if (/windows nt 6\.2/i.test(ua)) {
    os = "Windows 8";
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = "Windows 7";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  }
  // macOS
  else if (/macintosh|mac os x/i.test(ua)) {
    const macVersion = ua.match(/mac os x (\d+)[._](\d+)/i);
    if (macVersion) {
      const major = parseInt(macVersion[1]);
      const minor = parseInt(macVersion[2]);
      
      // Map version numbers to macOS names
      if (major === 10) {
        const versionNames: Record<number, string> = {
          15: "Catalina",
          16: "Big Sur",
        };
        if (minor >= 15 && versionNames[minor]) {
          os = `macOS ${versionNames[minor]}`;
        } else {
          os = `macOS 10.${minor}`;
        }
      } else if (major >= 11) {
        const names: Record<number, string> = {
          11: "Big Sur",
          12: "Monterey",
          13: "Ventura",
          14: "Sonoma",
          15: "Sequoia",
        };
        os = names[major] ? `macOS ${names[major]}` : `macOS ${major}`;
      } else {
        os = `macOS ${major}.${minor}`;
      }
    } else {
      os = "macOS";
    }
  }
  // iOS
  else if (/iphone|ipad|ipod/i.test(ua)) {
    const iosVersion = ua.match(/(?:iphone )?os (\d+)[._](\d+)/i);
    if (iosVersion) {
      os = `iOS ${iosVersion[1]}.${iosVersion[2]}`;
    } else {
      os = "iOS";
    }
  }
  // Android
  else if (/android/i.test(ua)) {
    const androidVersion = ua.match(/android[\/\s](\d+(?:\.\d+)?)/i);
    if (androidVersion) {
      os = `Android ${androidVersion[1]}`;
    } else {
      os = "Android";
    }
  }
  // Linux
  else if (/linux/i.test(ua)) {
    if (/ubuntu/i.test(ua)) {
      os = "Ubuntu";
    } else if (/debian/i.test(ua)) {
      os = "Debian";
    } else if (/fedora/i.test(ua)) {
      os = "Fedora";
    } else if (/arch/i.test(ua)) {
      os = "Arch Linux";
    } else {
      os = "Linux";
    }
  }
  // Chrome OS
  else if (/cros/i.test(ua)) {
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
