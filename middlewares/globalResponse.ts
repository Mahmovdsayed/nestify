import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

interface ErrorWithDetails extends Error {
  status?: number;
}

// Global error handler (minimal response)
export const globalErrorHandler = (err: Error, c: Context) => {
  let message = err.message || "Internal server error";

  // Hono built-in errors
  if (err instanceof HTTPException) {
    message = err.message;
  }

  // Custom AppError
  const custom = err as ErrorWithDetails;

  return c.json(
    {
      success: false,
      message,
    },
  );
};

export class AppError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error") {
    super(message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message);
  }
}
