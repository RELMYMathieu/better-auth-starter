import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  isAnonymous: boolean("is_anonymous"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const sessionCode = pgTable("session_code", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at"),
  usedBySessionId: text("used_by_session_id"),
  usedByUserId: text("used_by_user_id"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventType: text("event_type").notNull(),
  eventCategory: text("event_category").notNull(),
  severity: text("severity").notNull(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  userRole: text("user_role"),
  targetUserId: text("target_user_id"),
  targetUserEmail: text("target_user_email"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  success: text("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const emailChangeRequest = pgTable("email_change_request", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  currentEmail: text("current_email").notNull(),
  newEmail: text("new_email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  verifiedAt: timestamp("verified_at"),
});

export const sessionCodeRelations = relations(sessionCode, ({ one }) => ({
  createdByUser: one(user, {
    fields: [sessionCode.createdBy],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessionCodes: many(sessionCode),
  emailChangeRequests: many(emailChangeRequest),
}));

export const emailChangeRequestRelations = relations(
  emailChangeRequest,
  ({ one }) => ({
    user: one(user, {
      fields: [emailChangeRequest.userId],
      references: [user.id],
    }),
  })
);

export const AUDIT_EVENT_TYPES = {
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILURE: "login_failure",
  LOGOUT: "logout",
  SIGNUP: "signup",
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_CHANGE: "password_change",
  PASSWORD_RESET_REQUEST: "password_reset_request",
  PASSWORD_RESET_COMPLETE: "password_reset_complete",
  SESSION_REVOKED: "session_revoked",
  EMAIL_CHANGE_REQUEST: "email_change_request",
  EMAIL_CHANGE_COMPLETE: "email_change_complete",
  ACCOUNT_DELETED: "account_deleted",
  USER_BANNED: "user_banned",
  USER_UNBANNED: "user_unbanned",
  USER_DELETED: "user_deleted",
  USER_ROLE_CHANGED: "user_role_changed",
  USER_CREATED: "user_created",
  ALL_SESSIONS_REVOKED: "all_sessions_revoked",
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
  INVALID_TOKEN: "invalid_token",
} as const;

export const AUDIT_CATEGORIES = {
  AUTH: "auth",
  ADMIN: "admin",
  USER: "user",
  SECURITY: "security",
} as const;

export const AUDIT_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
} as const;
