import { Context } from "hono";
import { db } from "../db/drizzle.js";
import { todoTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

// GET ALL DATA
export const getAllToDoList = async (c: Context) => {
  try {
    const data = await db.select().from(todoTable);
    return c.json(data);
  } catch (error) {
    console.log("error in fetching all data from todo list: ", error);
  }
};

// CREATE A DATA
export const createToDoList = async (c: Context) => {
  try {
    const data = await c.req.json();
    const { title, description, completed, folderId, userId } = data;

    if (!data) {
      return c.json({ error: "Required Missing Fields" }, 409);
    }

    const newData = await db
      .insert(todoTable)
      .values({
        title,
        description,
        completed,
        folderId: folderId === "" ? null : Number(folderId),
        userId: userId ? Number(userId) : null,
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
