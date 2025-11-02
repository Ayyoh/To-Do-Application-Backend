import { Hono } from "hono";
import { todoRouter } from "./router/todo.routes.js";
import { userRouter } from "./router/user.routes.js";
import { folderRouter } from "./router/folder.routes.js";
import { authMiddleware } from "./middleware/auth.js";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import "dotenv/config";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_API_URL || "http://localhost:5173",
    credentials: true,
    allowHeaders: ["Content-type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  })
);
app.use("/api/todo/*", authMiddleware);

app.route("/api/users", userRouter);
app.route("/api/folders", folderRouter);
app.route("/api/todo", todoRouter);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT!) || 5000,
});

export default app;
