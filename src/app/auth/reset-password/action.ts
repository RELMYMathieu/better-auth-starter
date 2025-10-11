"use server";

import { auth } from "@/lib/auth";
import { ActionResult } from "@/lib/schemas";
import { APIError } from "better-auth/api";

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    if (!token) {
      return {
        success: null,
        error: { reason: "Invalid or missing reset token" },
      };
    }

    if (!newPassword || newPassword.length < 8) {
      return {
        success: null,
        error: { reason: "Password must be at least 8 characters long" },
      };
    }

    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
    });

    return {
      success: {
        reason: "Password reset successfully! Redirecting to login...",
      },
      error: null,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    
    if (error instanceof APIError) {
      return {
        success: null,
        error: {
          reason: error.message || "Failed to reset password. Token may be invalid or expired.",
        },
      };
    }

    return {
      success: null,
      error: { reason: "Something went wrong. Please try again." },
    };
  }
}
