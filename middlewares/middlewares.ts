import { Context, Next } from "hono";
import { connectToDatabase } from "../lib/connectToDatabase";
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";


export const rateLimit = (
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000,
) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || "anonymous";
    const now = Date.now();

    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return await next();
    }

    if (record.count >= limit) {
      return c.json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    }

    record.count++;
    return await next();
  };
};

export const apiKeyMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header("X-API-Key");

  if (apiKey && apiKey === API_SECRET_KEY) {
    return await next();
  }

  const origin = c.req.header("origin");
  const referer = c.req.header("referer");
  const host = c.req.header("host");

  if (origin || referer) {
    const requestOrigin = origin || new URL(referer!).origin;
    if (requestOrigin.includes(host?.split(":")[0] || "")) {
      return await next();
    }
  }

  const userAgent = c.req.header("user-agent") || "";
  const isInternalRequest =
    !origin && !referer && !userAgent.includes("Mozilla");
  if (isInternalRequest) {
    return await next();
  }

  return c.json({ success: false, message: "Invalid or missing API key" });
};


export const dbMiddleware = async (c: Context, next: Next) => {
  try {
    await connectToDatabase();
    await next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    return c.json({ success: false, message: "Database connection failed" });
  }
};