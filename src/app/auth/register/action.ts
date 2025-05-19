"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { user } from "@/db/schema";
import { ActionResult } from "@/lib/schemas";
import { registerSchema, RegisterSchema } from "@/lib/schemas";

export async function registerUser(
  formData: RegisterSchema
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: null,
      error: { reason: parsed.error.errors[0]?.message || "Invalid input" },
    };
  }

  const { email, password, name } = parsed.data;

  // Check if the user already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .execute();

  if (existingUser) {
    return {
      success: null,
      error: { reason: "User already exists" },
    };
  }

  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return {
      success: { reason: "Registration successful" },
      error: null,
      data: { user: { id: user.id, email: user.email } },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: null,
      error: { reason: "Error creating user" },
    };
  }
}
