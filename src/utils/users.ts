import { db } from "@/db";

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
}

export async function getUsers(): Promise<UserWithDetails[]> {
  // Get all users with their basic information
  const result = await db.query.user.findMany();

  // Query separate tables to get accounts information
  const accountsQuery = await db.query.account.findMany({
    columns: {
      userId: true,
      providerId: true,
    },
  });

  // Query session information
  const sessionsQuery = await db.query.session.findMany({
    columns: {
      userId: true,
      createdAt: true,
    },
    orderBy: (session) => [session.createdAt],
  });

  // Group accounts by user ID
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

  // Get last sign in date by user ID
  const lastSignInByUser = sessionsQuery.reduce(
    (acc, session) => {
      if (!acc[session.userId] || session.createdAt > acc[session.userId]) {
        acc[session.userId] = session.createdAt;
      }
      return acc;
    },
    {} as Record<string, Date>,
  );

  // Transform the raw data into the format expected by the UsersTable component
  return result.map((user) => {
    const accounts = accountsByUser[user.id] || [];

    // If the banned field is null or undefined, default to false
    const banned = user.banned ?? false;

    // Get ban reason and expiry information if available
    const banReason = user.banReason || "";
    const banExpires = user.banExpires || null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.emailVerified,
      banned,
      banReason,
      banExpires,
      accounts,
      lastSignIn: lastSignInByUser[user.id] || null,
      createdAt: user.createdAt,
      avatarUrl: user.image || `/placeholder.svg?height=40&width=40`,
    };
  });
}
