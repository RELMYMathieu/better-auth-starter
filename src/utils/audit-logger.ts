import { db } from "@/db";
import { auditLog, AUDIT_EVENT_TYPES, AUDIT_CATEGORIES, AUDIT_SEVERITY } from "@/db/schema";

interface AuditLogParams {
  eventType: keyof typeof AUDIT_EVENT_TYPES;
  category: keyof typeof AUDIT_CATEGORIES;
  severity: keyof typeof AUDIT_SEVERITY;
  description: string;
  success: boolean;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      eventType: AUDIT_EVENT_TYPES[params.eventType],
      eventCategory: AUDIT_CATEGORIES[params.category],
      severity: AUDIT_SEVERITY[params.severity],
      description: params.description,
      success: params.success.toString(),
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      targetUserId: params.targetUserId,
      targetUserEmail: params.targetUserEmail,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      sessionId: params.sessionId,
      metadata: params.metadata,
      errorMessage: params.errorMessage,
    });
  } catch (error) {
    console.error("[AUDIT LOG ERROR]", error, params);
  }
}

export function getRequestMetadata(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress: 
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}

export async function logLoginSuccess(params: {
  userId: string;
  userEmail: string;
  userRole: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}) {
  await logAuditEvent({
    eventType: "LOGIN_SUCCESS",
    category: "AUTH",
    severity: "INFO",
    description: `User ${params.userEmail} logged in successfully`,
    success: true,
    ...params,
  });
}

export async function logLoginFailure(params: {
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  errorMessage: string;
}) {
  await logAuditEvent({
    eventType: "LOGIN_FAILURE",
    category: "SECURITY",
    severity: "WARNING",
    description: `Failed login attempt for ${params.userEmail || "unknown email"}`,
    success: false,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    errorMessage: params.errorMessage,
  });
}

export async function logPasswordChange(params: {
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}) {
  await logAuditEvent({
    eventType: "PASSWORD_CHANGE",
    category: "AUTH",
    severity: "INFO",
    description: `User ${params.userEmail} changed their password`,
    success: true,
    ...params,
  });
}

export async function logUserBanned(params: {
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  reason: string;
  ipAddress: string;
  userAgent: string;
}) {
  await logAuditEvent({
    eventType: "USER_BANNED",
    category: "ADMIN",
    severity: "CRITICAL",
    description: `Admin ${params.adminEmail} banned user ${params.targetUserEmail}`,
    success: true,
    userId: params.adminId,
    userEmail: params.adminEmail,
    targetUserId: params.targetUserId,
    targetUserEmail: params.targetUserEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { banReason: params.reason },
  });
}

export async function logUserUnbanned(params: {
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  ipAddress: string;
  userAgent: string;
}) {
  await logAuditEvent({
    eventType: "USER_UNBANNED",
    category: "ADMIN",
    severity: "INFO",
    description: `Admin ${params.adminEmail} unbanned user ${params.targetUserEmail}`,
    success: true,
    userId: params.adminId,
    userEmail: params.adminEmail,
    targetUserId: params.targetUserId,
    targetUserEmail: params.targetUserEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

export async function logAccountDeleted(params: {
  userId: string;
  userEmail: string;
  deletedBy: "self" | "admin";
  adminId?: string;
  adminEmail?: string;
  ipAddress: string;
  userAgent: string;
}) {
  await logAuditEvent({
    eventType: "ACCOUNT_DELETED",
    category: params.deletedBy === "admin" ? "ADMIN" : "USER",
    severity: "CRITICAL",
    description: 
      params.deletedBy === "admin"
        ? `Admin ${params.adminEmail} deleted account ${params.userEmail}`
        : `User ${params.userEmail} deleted their own account`,
    success: true,
    userId: params.deletedBy === "admin" ? params.adminId : params.userId,
    userEmail: params.deletedBy === "admin" ? params.adminEmail : params.userEmail,
    targetUserId: params.deletedBy === "admin" ? params.userId : undefined,
    targetUserEmail: params.deletedBy === "admin" ? params.userEmail : undefined,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

export async function logSuspiciousActivity(params: {
  userId?: string;
  userEmail?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}) {
  await logAuditEvent({
    eventType: "SUSPICIOUS_ACTIVITY",
    category: "SECURITY",
    severity: "CRITICAL",
    description: params.description,
    success: false,
    userId: params.userId,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.metadata,
  });
}
