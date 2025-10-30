import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

// special imports
import jwtImports from "jsonwebtoken";
const { verify } = jwtImports;

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const token = getCookie(c, "token");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    const decoded = verify(token, process.env.JWT_SECRET!);
    c.set("user", decoded);

    await next(); // ✅ just continue normally
  } catch (error) {
    console.log("error in authentication middleware: ", error);
    return c.json({ error: "Unauthorized or invalid token" }, 401)
  }
};
