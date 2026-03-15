import { signInAction } from "@/app/actions/auth/signInAction.auth";
import { signUpAction } from "@/app/actions/auth/signUpAction.auth";
import { authRateLimiter } from "@/middlewares/rateLimiter.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { signInValidationSchema } from "@/validations/auth/signIn.validation";
import { signUpValidaionSchema } from "@/validations/auth/signup.validation";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post(
  "/signup",
  authRateLimiter(),
  validate("json", signUpValidaionSchema),
  signUpAction,
);

authRoutes.post(
  "/signin",
  authRateLimiter(),
  validate("json", signInValidationSchema),
  signInAction,
);

export default authRoutes;
