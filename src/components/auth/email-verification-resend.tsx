"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/app/auth/actions";
import { FormSuccess, FormError } from "@/components/ui/form-messages";
import { AlertCircle } from "lucide-react";

interface EmailVerificationResendProps {
  email: string;
  onSuccess?: () => void;
}

export function EmailVerificationResend({
  email,
  onSuccess,
}: EmailVerificationResendProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendState, setResendState] = useState<{
    success?: string;
    error?: string;
  }>({});

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendState({});
    
    const result = await resendVerificationEmail(email);
    
    if (result.success) {
      setResendState({ success: result.success.reason, error: undefined });
      onSuccess?.();
    } else if (result.error) {
      setResendState({ error: result.error.reason, success: undefined });
    }
    
    setIsResending(false);
  };

  return (
    <div className="rounded bg-yellow-50 border border-yellow-200 px-3 py-3 text-sm space-y-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-yellow-800 font-medium mb-1">
            Your email is not verified yet.
          </p>
          <p className="text-yellow-700 text-xs mb-2">
            Still didn&#39;t get your verification email? You can request it again.
          </p>
        </div>
      </div>

      {resendState.success && (
        <FormSuccess message={resendState.success} />
      )}
      {resendState.error && (
        <FormError message={resendState.error} />
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleResendVerification}
        disabled={isResending}
        className="w-full bg-white hover:bg-yellow-50"
      >
        {isResending ? "Sending..." : "Resend verification email"}
      </Button>

      <p className="text-yellow-600 text-xs flex items-start gap-1">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>
          Limited to 3 requests per 5 minutes to prevent abuse. Check your spam folder if you don&#39;t see the email.
        </span>
      </p>
    </div>
  );
}
