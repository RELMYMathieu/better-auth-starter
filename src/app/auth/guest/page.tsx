import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuestLoginPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid code");
        setIsLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Guest Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter Guest Code
              </label>
              <Input
                type="text"
                placeholder="XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono text-lg text-center tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Continue as Guest"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
