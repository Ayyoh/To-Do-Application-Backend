import "dotenv/config";
import { Context } from "hono";
import { db } from "../db/drizzle.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { deleteCookie, setCookie } from "hono/cookie";

import jwtImports, { verify } from "jsonwebtoken";
const { sign } = jwtImports;

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
    const authHeader = c.req.header("authorization");
    if (!authHeader) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verify(token, process.env.JWT_SECRET!);

    if (typeof payload === "string" || !("id" in payload)) {
      return c.json({ error: "Invalid token payload" }, 401);
    }

    const userId = payload.id;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.id));

    if (!user) return c.json({ error: "user not found" }, 404);

    return c.json(user)
  } catch (error) {
    console.log("error in meAuth: ", error);
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

    const hashed = await hashPassword(password);
    const user = await db
      .insert(usersTable)
      .values({ username, email, password: hashed })
      .returning();

    return c.json({ message: "user registered", data: user }, 201);
  } catch (error) {
    console.log("error in signing up: ", error);
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
      sameSite: "Strict",
      secure: false, // change to true if HTTPS
    });

    return c.json({ message: "Login successful", token });
  } catch (error) {
    console.log("error in signing in: ", error);
  }
};

export const logout = (c: Context) => {
  deleteCookie(c, "token");
  return c.json({ message: "Logged out" });
};
