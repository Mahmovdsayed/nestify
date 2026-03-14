import { apiKeyMiddleware, dbMiddleware, rateLimit } from "@/middlewares/middlewares";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import authRoutes from "@/routes/auth.routes";

const app = new Hono().basePath("/api/v1");

app.use("*", dbMiddleware);
app.use("*", apiKeyMiddleware);
app.use("*", rateLimit(5, 60 * 1000));

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Welcome to Nestify API",
    data: {
      name: "Nestify",
      description: "A modern e-commerce full-stack Next.js application",
      author: {
        name: "Mahmoud Sayed",
        github: "https://github.com/Mahmovdsayed",
      },
      license: "MIT",
      repository: "https://github.com/Mahmovdsayed/nestify",
      version: "1.0.0",
      status: "under development",
    },
  });
});

// Routes
app.route("/auth", authRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
