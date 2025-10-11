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
  const { data, error, mutate, isLoading } = useSWR<Session[]>(
    "/api/user/sessions",
    fetcher,
    {
      refreshInterval: 30000,
      shouldRetryOnError: false,
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

  // Defensive check: ensure data is an array
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
                    {device !== "Desktop" && device !== "Unknown" && (
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
    </div>
  );
}
