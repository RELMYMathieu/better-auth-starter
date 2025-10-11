"use server";

import { authClient } from "@/lib/auth-client";
import { ActionResult } from "@/lib/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/config";

export async function resendVerificationEmail(
  email: string
): Promise<ActionResult> {
  try {
    if (!email || !email.includes("@")) {
      return {
        success: null,
        error: { reason: "Please provide a valid email address" },
      };
    }

    await (authClient as any).sendVerificationEmail({
      email,
      callbackURL: DEFAULT_LOGIN_REDIRECT,
    });

    return {
      success: {
        reason: "Verification email sent! Please check your inbox.",
      },
      error: null,
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: null,
      error: {
        reason: "Failed to send verification email. Please try again later.",
      },
    };
  }
}
