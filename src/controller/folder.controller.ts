import { Context } from "hono";
import { db } from "../db/drizzle.js";
import { foldersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";

import jwtImport from "jsonwebtoken";
const { verify } = jwtImport;

export const getAllFolders = async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) {
      return c.json({ error: "No Token" }, 401);
    }

    const decoded = verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { id: number }).id;

    const folders = await db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.userId, userId));

    return c.json({ folders }, 200);
  } catch (error) {
    console.log("error in getAllFolders: ", error);
  }
};

export const createFolder = async (c: Context) => {
  try {
    const data = await c.req.json();
    const { folderName, userId } = data;

    if (!data.folderName || !data.userId) {
      return c.json({ error: "Missing Fields Required" }, 409);
    }

    const folderExists = await db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.folderName, folderName));

    if (folderExists.length > 0) {
      return c.json({ error: "Folder already exists" }, 409);
    }

    const newData = await db
      .insert(foldersTable)
      .values({ folderName, userId: userId ? Number(userId) : null })
      .returning();

    return c.json(newData, 201);
  } catch (error) {
    console.log("error in createFolder: ", error);
  }
};

export const removeFolder = async (c: Context) => {
  try {
    const id = Number(c.req.param("id"));
    const data = await db
      .delete(foldersTable)
      .where(eq(foldersTable.id, id))
      .returning();

    if (data.length <= 0) {
      return c.json({ error: "Folder doesnt exist" }, 409);
    }

    return c.json({ message: "Folder removed successfully", removed: data });
  } catch (error) {
    console.log("error in removeFolder: ", error);
  }
};
