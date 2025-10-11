"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/config";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResult<{ user: { id: string; email: string }; redirect: string }>> {
  try {
    await auth.api.signInEmail({ body: { email, password } });

    return {
      success: { reason: "Login successful" },
      error: null,
      data: {
        user: { id: "", email },
        redirect: DEFAULT_LOGIN_REDIRECT,
      },
    };
  } catch (err) {
    if (err instanceof APIError) {
      return {
        error: { reason: err.message },
        success: null,
      };
    }

    return { error: { reason: "Something went wrong." }, success: null };
  }
}
