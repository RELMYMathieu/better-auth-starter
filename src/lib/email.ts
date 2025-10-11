import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

// Simple in-memory rate limiter for email sending
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit: 3 emails per recipient per 5 minutes
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in ms
const RATE_LIMIT_MAX = 3;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(email, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(email);
    }
  }
}, 60 * 1000); // Clean up every minute

export const sendEmail = async (payload: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    // Check rate limit
    if (!checkRateLimit(payload.to)) {
      console.warn(`Rate limit exceeded for email: ${payload.to}`);
      throw new Error(
        "Too many emails sent. Please try again in a few minutes."
      );
    }

    const client = getResendClient();
    const response = await client.emails.send({
      from: "Unicol Administration <noreply@mail.unicol.me>",
      ...payload,
    });

    if (response?.data) return true;
    return false;
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw error;
  }
};
