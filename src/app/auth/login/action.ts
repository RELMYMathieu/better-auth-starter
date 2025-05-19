"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResult<{ user: { id: string; email: string } }>> {
  try {
    await auth.api.signInEmail({ body: { email, password } });

    return {
      success: { reason: "Login successful" },
      error: null,
      data: undefined,
    };
  } catch (err) {
    if (err instanceof APIError) {
      switch (err.status) {
        case "UNAUTHORIZED":
          return { error: { reason: "User Not Found." }, success: null };
        case "BAD_REQUEST":
          return { error: { reason: "Invalid email." }, success: null };
        case "FORBIDDEN":
          return {
            error: { reason: "Email verification required." },
            success: null,
          };
        default:
          return { error: { reason: "Something went wrong." }, success: null };
      }
    }

    return { error: { reason: "Something went wrong." }, success: null };
  }
}
