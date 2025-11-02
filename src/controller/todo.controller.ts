import { Context } from "hono";
import { db } from "../db/drizzle.js";
import { todoTable } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";

import jwtImports from "jsonwebtoken";
const { verify } = jwtImports;

// GET ALL DATA
export const getAllTodoList = async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ error: "No Token" }, 401);

    const decoded = verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { id: number }).id;

    // Get ALL todos of the user
    const todos = await db
      .select()
      .from(todoTable)
      .where(eq(todoTable.userId, userId));

    return c.json({ todos }, 200);
  } catch (error) {
    console.log("error in getAllTodos:", error);
    return c.json({ error: "Server error" }, 500);
  }
};

export const getAllToDoListFromFolder = async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) {
      return c.json({ error: "No Token" }, 401);
    }

    const decoded = verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { id: number }).id;
    const folderId = Number(c.req.param("folderId"));

    const todos = await db
      .select()
      .from(todoTable)
      .where(
        and(eq(todoTable.folderId, folderId), eq(todoTable.userId, userId))
      );

    return c.json({ todos }, 200);
  } catch (error) {
    console.log("error in fetching all data from todo list: ", error);
  }
};

// CREATE A DATA
export const createToDoList = async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ error: "No Token" }, 401);

    const decoded = verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { id: number }).id;

    const data = await c.req.json();
    const { title, description, completed, folderId } = data;

    if (!title) {
      return c.json({ error: "Required Missing Fields" }, 409);
    }

    const newData = await db
      .insert(todoTable)
      .values({
        title,
        description,
        completed,
        folderId: folderId ? Number(folderId) : null,
        userId
      })
      .returning();

    return c.json(newData, 201);
  } catch (error) {
    console.log("error in creating a todo list: ", error);
  }
};

// REMOVE A DATA
export const removeToDoList = async (c: Context) => {
  try {
    const id = Number(c.req.param("id"));
    const data = await db
      .delete(todoTable)
      .where(eq(todoTable.id, id))
      .returning();

    if (data.length <= 0) {
      return c.json({ error: "To-do task doesnt exist" }, 409);
    }

    return c.json({ message: "removed successfully", deleted: data });
  } catch (error) {
    console.log("error in deleting todo list: ", error);
  }
};
