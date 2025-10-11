"use server";

import { auth } from "@/lib/auth";
import { ActionResult } from "@/lib/schemas";

export async function requestPasswordReset(
  email: string
): Promise<ActionResult> {
  try {
    if (!email || !email.includes("@")) {
      return {
        success: null,
        error: { reason: "Please provide a valid email address" },
      };
    }

    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: `${process.env.BETTER_AUTH_URL}/auth/reset-password`,
      },
    });

    return {
      success: {
        reason:
          "If an account exists with this email, you will receive a password reset link shortly.",
      },
      error: null,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: {
        reason:
          "If an account exists with this email, you will receive a password reset link shortly.",
      },
      error: null,
    };
  }
}
