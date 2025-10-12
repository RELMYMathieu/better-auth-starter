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
  Eye,
  EyeOff,
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
  deviceInfo: {
    device: string;
    browser: string;
    os: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error(res.status === 401 ? 'Unauthorized' : 'Failed to fetch sessions');
  }
  return res.json();
});

function getDeviceIcon(device: string) {
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes("mobile") || deviceLower.includes("phone")) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (deviceLower.includes("tablet") || deviceLower.includes("ipad")) {
    return <Tablet className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
}

function getBrowserIcon(browser: string) {
  const browserLower = browser.toLowerCase();
  if (browserLower.includes("chrome")) return <Chrome className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
}

function maskIpAddress(ip: string | null): string {
  if (!ip) return "Unknown";
  const parts = ip.split(".");
  if (parts.length === 4) {
    // IPv4: show first octet, hide rest
    return `${parts[0]}.•••.•••.•••`;
  }
  // IPv6 or other: show first segment
  const segments = ip.split(":");
  if (segments.length > 1) {
    return `${segments[0]}:••••:••••:••••`;
  }
  return "•••.•••.•••.•••";
}

export function SessionsManager() {
  const { data, error, mutate, isLoading } = useSWR<Session[]>(
    "/api/user/sessions",
    fetcher,
    {
      refreshInterval: 30000,
      shouldRetryOnError: false,
    }
  );

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revealedIps, setRevealedIps] = useState<Set<string>>(new Set());

  const toggleIpReveal = (sessionId: string) => {
    setRevealedIps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

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
        {error.message === 'Unauthorized' 
          ? 'Please log in again to view your sessions.'
          : 'Failed to load sessions. Please try again.'}
      </div>
    );
  }

  if (isLoading || !data) {
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

  const sessions = Array.isArray(data) ? data : [];

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No active sessions found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const { device, browser, os } = session.deviceInfo;
        const isRevoking = revokingId === session.id;
        const isIpRevealed = revealedIps.has(session.id);

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
                    {/* IP Address with reveal button */}
                    {session.ipAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="font-mono text-xs">
                          {isIpRevealed ? session.ipAddress : maskIpAddress(session.ipAddress)}
                        </span>
                        <button
                          onClick={() => toggleIpReveal(session.id)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title={isIpRevealed ? "Hide IP address" : "Show IP address"}
                        >
                          {isIpRevealed ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        Last active {format(new Date(session.updatedAt), "PPp")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {getBrowserIcon(browser)}
                      <span className="truncate">
                        Signed in {format(new Date(session.createdAt), "PPp")}
                      </span>
                    </div>

                    {/* Device badge */}
                    <div className="flex items-center gap-2 text-xs">
                      {getDeviceIcon(device)}
                      <span className="truncate">{device}</span>
                    </div>
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
    </div>
  );
}
