import { signUpAction } from "@/app/actions/auth/signUpAction.auth";
import { authRateLimiter } from "@/middlewares/rateLimiter.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { signUpValidaionSchema } from "@/validations/auth/signup.validation";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post(
  "/signup",
  authRateLimiter(),
  validate("json", signUpValidaionSchema),
  signUpAction,
);

export default authRoutes;
