"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd } from "lucide-react";
import PasswordInput from "@/components/auth/password-input";
import { resetPassword } from "./action";
import { FormSuccess, FormError } from "@/components/ui/form-messages";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [token, setToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setFormState({
        error: { reason: "Invalid or missing reset token" },
      } as any);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setFormState({
        error: { reason: "Invalid or missing reset token" },
      } as any);
      return;
    }

    setFormState({});
    setIsLoading(true);

    const result = await resetPassword(token, password);
    
    if (result.success) {
      setFormState({ success: result.success.reason });
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else if (result.error) {
      setFormState({ error: result.error.reason });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <div className="flex flex-col items-center w-full max-w-md gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Zexa Better Auth
        </a>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-semibold">Reset your password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormSuccess message={formState.success || ""} />
              <FormError message={formState.error || ""} />
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !token} 
                className="w-full"
              >
                {isLoading ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
