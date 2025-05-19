"use server";

import { ActionResult } from "@/lib/schemas";
import { auth } from "@/lib/auth";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResult<{ user: { id: string; email: string } }>> {
  try {
    const { user } = await auth.api.signInEmail({ body: { email, password } });

    if (!user) {
      return {
        success: null,
        error: { reason: "Invalid credentials" },
      };
    }

    return {
      success: { reason: "Login successful" },
      error: null,
      data: undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return {
      success: null,
      error: { reason: message },
    };
  }
}
