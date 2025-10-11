"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GalleryVerticalEnd, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "./action";
import { FormSuccess, FormError } from "@/components/ui/form-messages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({});
    setIsLoading(true);

    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setFormState({ success: result.success.reason });
      setEmail("");
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
              <h1 className="text-2xl font-semibold">Forgot password?</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&#39;ll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormSuccess message={formState.success || ""} />
              <FormError message={formState.error || ""} />
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
