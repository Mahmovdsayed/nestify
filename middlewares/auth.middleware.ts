import type { Context, MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "./globalResponse";
import User from "@/models/user.model";

interface JWTPayload {
  id: string;
  role: string;
}

interface AuthUser {
  id: string;
  role: string;
  isVerified: string;
  email: string;
}

// Extend Hono's context type to include authUser
declare module "hono" {
  interface ContextVariableMap {
    authUser: AuthUser;
  }
}

export const auth = (): MiddlewareHandler => {
  return async (c: Context, next) => {
    try {
      // Get Authorization header
      const authHeader = c.req.header("Authorization");

      if (!authHeader) {
        throw new UnauthorizedError("Please login first");
      }

      // Check if it starts with "Bearer "
      if (!authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError(
          "Invalid token prefix. Use 'Bearer' prefix",
        );
      }

      // Extract token after "Bearer "
      const token = authHeader.substring(7); // "Bearer ".length = 7

      if (!token) {
        throw new UnauthorizedError("Token missing after Bearer prefix");
      }

      // Verify JWT secret is configured
      const jwtSecret = process.env.LOGIN_SIG;
      if (!jwtSecret) {
        console.error("LOGIN_SIG environment variable is not set");
        throw new UnauthorizedError("Authentication configuration error");
      }

      // Verify JWT token using Hono's jwt verify
      let decodedData: JWTPayload;
      try {
        const payload = await verify(token, jwtSecret, "ES256");
        decodedData = payload as unknown as JWTPayload;
      } catch (err) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      // Validate token payload
      if (!decodedData || !decodedData.id || !decodedData.role) {
        throw new UnauthorizedError("Invalid token payload");
      }

      // Find user in database
      const findUser = await User.findById(decodedData.id).select(
        "_id role userName email isVerified",
      );

      if (!findUser) {
        throw new NotFoundError("User not found. Please sign up first");
      }

      // Store user in context as AuthUser with string _id
      c.set("authUser", {
        id: findUser._id.toString(),
        role: findUser.role,
        isVerified: findUser.isVerified.toString(),
        email: findUser.email,
      });

      await next();
    } catch (error) {
      // Re-throw custom errors
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Auth middleware error:", error);
      throw new UnauthorizedError("Authentication failed");
    }
  };
};

export const checkRole = (...allowedRoles: string[]): MiddlewareHandler => {
  return async (c: Context, next) => {
    const user = c.var.authUser;

    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      );
    }

    await next();
  };
};
