import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface UserWithDetails {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  banned: boolean;
  banReason?: string;
  banExpires?: Date | null;
  accounts: string[];
  lastSignIn: Date | null;
  createdAt: Date;
  avatarUrl: string;
  role?: string;
}

export interface GetUsersOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  status?: string;
  email?: string;
  name?: string;
}

interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date | null;
  image?: string;
  createdAt: Date;
}

export async function getUsers(
  options: GetUsersOptions = {},
): Promise<{ users: UserWithDetails[]; total: number }> {
  const query: Record<string, any> = {
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
  };

  if (options.sortBy) query.sortBy = options.sortBy;
  if (options.sortDirection) query.sortDirection = options.sortDirection;

  if (options.role) {
    query.filterField = "role";
    query.filterOperator = "eq";
    query.filterValue = options.role;
  }

  if (options.status) {
    query.filterField = "banned";
    query.filterOperator = "eq";
    query.filterValue = options.status === "banned" ? true : false;
  }

  if (options.email) {
    query.searchField = "email";
    query.searchOperator = "contains";
    query.searchValue = options.email;
  }

  if (options.name) {
    query.searchField = "name";
    query.searchOperator = "contains";
    query.searchValue = options.name;
  }

  const result = await (auth.api as any).listUsers({
    headers: await headers(),
    query,
  });

  if (!result.users) {
    return { users: [], total: 0 };
  }

  const accountsQuery = await db.query.account.findMany({
    columns: {
      userId: true,
      providerId: true,
    },
  });

  const sessionsQuery = await db.query.session.findMany({
    columns: {
      userId: true,
      createdAt: true,
    },
    orderBy: (session) => [session.createdAt],
  });

  const accountsByUser = accountsQuery.reduce(
    (acc, account) => {
      if (!acc[account.userId]) {
        acc[account.userId] = [];
      }
      acc[account.userId].push(account.providerId);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const lastSignInByUser = sessionsQuery.reduce(
    (acc, session) => {
      if (!acc[session.userId] || session.createdAt > acc[session.userId]) {
        acc[session.userId] = session.createdAt;
      }
      return acc;
    },
    {} as Record<string, Date>,
  );

  const users: UserWithDetails[] = result.users.map((user: BetterAuthUser) => {
    const accounts = accountsByUser[user.id] || [];
    const banned = user.banned ?? false;
    const banReason = user.banReason || "";
    const banExpires = user.banExpires || null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.emailVerified,
      role: user.role,
      banned,
      banReason,
      banExpires,
      accounts,
      lastSignIn: lastSignInByUser[user.id] || null,
      createdAt: user.createdAt,
      avatarUrl: user.image || "",
    };
  });

  return { users, total: result.total ?? users.length };
}
