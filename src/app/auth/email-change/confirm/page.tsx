"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmailChangeConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing token");
      return;
    }

    const confirmEmailChange = async () => {
      try {
        const response = await fetch("/api/user/email-change/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email changed successfully!");
          setTimeout(() => {
            router.push("/dashboard/settings");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to confirm email change");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred" + (error instanceof Error ? `: ${error.message}` : ""));
      }
    };

    confirmEmailChange();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirming email change...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Email Changed!</h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting to settings...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <Button asChild>
                  <Link href="/dashboard/settings">Back to Settings</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
