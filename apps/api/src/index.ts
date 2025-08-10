import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clerkMiddleware } from "@hono/clerk-auth";

type Env = {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.vercel.app"],
    credentials: true,
  }),
);
app.use("*", clerkMiddleware());

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Example protected route
app.get("/api/user", (c) => {
  const auth = c.get("clerkAuth");
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});

// Posts routes
app.get("/api/posts", async (c) => {
  // TODO: Implement database fetch
  return c.json([
    { id: 1, title: "First Post", content: "Hello World" },
    { id: 2, title: "Second Post", content: "Hono.js with Cloudflare" },
  ]);
});

app.post("/api/posts", async (c) => {
  const auth = c.get("clerkAuth");
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  // TODO: Implement database insert
  return c.json({ id: 3, ...body, userId: auth.userId });
});

export default app;
