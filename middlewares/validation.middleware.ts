import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";

type ValidationTarget = "json" | "query" | "param" | "header" | "form";

export const validate = <T extends ValidationTarget>(
  target: T,
  schema: ZodSchema,
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validation error please check your inputs",
          errors: result.error.issues.map((e) => {
            const path = e.path.length > 0 ? e.path.join(".") : target;
            return `${path} - ${e.message}`;
          }),
        },
        400,
      );
    }
  });

interface ValidationSchema {
  json?: ZodSchema;
  query?: ZodSchema;
  param?: ZodSchema;
  header?: ZodSchema;
  form?: ZodSchema;
}

export const validateAll = (schemas: ValidationSchema) => {
  const middlewares = [];

  if (schemas.json) middlewares.push(validate("json", schemas.json));
  if (schemas.query) middlewares.push(validate("query", schemas.query));
  if (schemas.param) middlewares.push(validate("param", schemas.param));
  if (schemas.header) middlewares.push(validate("header", schemas.header));
  if (schemas.form) middlewares.push(validate("form", schemas.form));

  return middlewares;
};
