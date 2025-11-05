import "dotenv/config";
import { Context } from "hono";
import { db } from "../db/drizzle.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import jwtImports from "jsonwebtoken";
const { sign, verify } = jwtImports;

export const getAllUsers = async (c: Context) => {
  try {
    const data = await db.select().from(usersTable);
    return c.json(data);
  } catch (error) {
    console.log("error in getAllUsers: ", error);
  }
};

export const meAuth = async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ error: "No token found" }, 401);

    const decoded = verify(token, process.env.JWT_SECRET!);
    c.set("user", decoded);

    return c.json(decoded);
  } catch (error) {
    console.error("error in meAuth:", error);
    return c.json({ error: "Unauthorized or invalid token" }, 401);
  }
};

export const register = async (c: Context) => {
  try {
    const data = await c.req.json();
    const { username, email, password } = data;

    const userExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (userExists.length > 0) {
      return c.json({ error: "email already exists" }, 400);
    }

    if (password.length < 8) {
      return c.json(
        { error: "password must be at least 8 characters long" },
        409
      );
    }

    const hashed = await hashPassword(password);
    const user = await db
      .insert(usersTable)
      .values({ username, email, password: hashed })
      .returning();

    return c.json({ message: "user registered", data: user }, 201);
  } catch (error) {
    console.log("error in signing up: ", error);
    return c.json({ error: "Failed in register" }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const data = await c.req.json();
    const { email, password } = data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user) return c.json({ error: "Invalid Credentials" }, 401);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return c.json({ error: "Invalid Credentials" }, 401);

    const token = sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    setCookie(c, "token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "None",
      secure: true, // change to true if HTTPS
    });

    return c.json({ message: "Login successful", token });
  } catch (error) {
    console.log("error in signing in: ", error);
    return c.json({ error: "Failed in logging in" }, 500);
  }
};

export const logout = (c: Context) => {
  deleteCookie(c, "token", {
    path: "/",
    sameSite: "None",
    secure: true
  });
  return c.json({ message: "Logged out" });
};
