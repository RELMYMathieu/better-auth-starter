"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/auth/login");
            },
            onError: (ctx) => {
              setError(ctx.error.message || "Failed to log out");
            },
          },
        });
      } catch (err) {
        setError("An unexpected error occurred" + (err instanceof Error ? `: ${err.message}` : ""));
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-primary hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Logging you out...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
