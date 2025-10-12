import { authClient } from "@/lib/auth-client";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const adminAPI = (authClient as any).admin;

async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export async function banUser(
  userId: string,
  banReason: string,
  banExpiresIn?: number,
) {
  await revokeAllUserSessions(userId);

  const res = await adminAPI.banUser({
    userId,
    banReason,
    banExpiresIn,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to ban user");
  }

  return res;
}

export async function unbanUser(userId: string) {
  const res = await adminAPI.unbanUser({
    userId,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to unban user");
  }

  return res;
}

export async function deleteUser(userId: string) {
  await revokeAllUserSessions(userId);

  const res = await adminAPI.removeUser({
    userId,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to delete user");
  }

  return res;
}

export async function revokeUserSessions(userId: string) {
  await revokeAllUserSessions(userId);
  return { success: true };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin" | ("user" | "admin")[];
  data?: Record<string, any>;
  autoVerify?: boolean;
}) {
  const { autoVerify, ...userData } = data;

  const createData = {
    ...userData,
    data: {
      ...userData.data,
      ...(autoVerify ? { emailVerified: true } : {}),
    },
  };

  const res = await adminAPI.createUser(createData);

  if (res?.error) {
    throw new Error(res.error.message || "Failed to create user");
  }

  if (!autoVerify) {
    try {
      await (authClient as any).sendVerificationEmail({
        email: data.email,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  }

  return res;
}

export async function updateUserRole(userId: string, role: string) {
  const res = await adminAPI.setRole({
    userId,
    role: role as "user" | "admin" | ("user" | "admin")[],
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to update user role");
  }

  return res;
}
