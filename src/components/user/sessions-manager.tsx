"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import {
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function parseUserAgent(ua: string | null) {
  if (!ua) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  let device = "Desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "Mobile";
  }

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
    os = "Linux";
  } else if (/ubuntu/i.test(ua)) {
    os = "Ubuntu";
  } else if (/debian/i.test(ua)) {
    os = "Debian";
  } else if (/fedora/i.test(ua)) {
    os = "Fedora";
  } else if (/cros/i.test(ua)) {
    os = "Chrome OS";
  }

  return { device, browser, os };
}

function getDeviceIcon(device: string) {
  switch (device) {
    case "Mobile":
      return <Smartphone className="h-5 w-5" />;
    case "Tablet":
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
}

function getBrowserIcon(browser: string) {
  if (browser === "Chrome") return <Chrome className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
}

export function SessionsManager() {
  const { data: sessions, error, mutate, isLoading } = useSWR<Session[]>(
    "/api/user/sessions",
    fetcher,
    {
      refreshInterval: 30000,
    }
  );

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to log out this session?")) return;

    setRevokingId(sessionId);
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to revoke session");

      toast.success("Session logged out successfully");
      mutate();
    } catch {
      toast.error("Failed to log out session");
    } finally {
      setRevokingId(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load sessions. Please try again.
      </div>
    );
  }

  if (isLoading || !sessions) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const { device, browser, os } = parseUserAgent(session.userAgent);
        const isRevoking = revokingId === session.id;

        return (
          <div
            key={session.id}
            className={`border rounded-lg p-4 transition-all ${
              session.isCurrent
                ? "bg-primary/5 border-primary/20"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1 min-w-0">
                {/* Device Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  {getDeviceIcon(device)}
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base">
                      {browser} on {os}
                    </h3>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Current Session
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {session.ipAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{session.ipAddress}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        Last active{" "}
                        {format(new Date(session.updatedAt), "PPp")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {getBrowserIcon(browser)}
                      <span className="truncate">
                        Signed in {format(new Date(session.createdAt), "PPp")}
                      </span>
                    </div>

                    {/* Show device type for clarity */}
                    {device !== "Desktop" && (
                      <div className="flex items-center gap-2 text-xs">
                        {getDeviceIcon(device)}
                        <span className="truncate">{device}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0">
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                  >
                    {isRevoking ? (
                      <>Logging out...</>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {sessions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No active sessions found.
        </div>
      )}
    </div>
  );
}
