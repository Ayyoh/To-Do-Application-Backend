import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp(),
});

export const foldersTable = pgTable("folders", {
  id: serial().primaryKey(),
  folderName: varchar({ length: 255 }).notNull().unique(),
  userId: integer().references(() => usersTable.id),
  createdAt: timestamp(),
});

export const todoTable = pgTable("todo", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  completed: boolean(),
  folderId: integer().references(() => foldersTable.id),
  userId: integer().references(() => usersTable.id),
  createdAt: timestamp(),
});
