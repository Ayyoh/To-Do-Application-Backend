import { Hono } from "hono";
import {
  createToDoList,
  getAllTodoList,
  getAllToDoListFromFolder,
  removeToDoList,
} from "../controller/todo.controller.js";

export const todoRouter = new Hono();

todoRouter.get("/todos", getAllTodoList);
todoRouter.get("/folders/:folderId/todos", getAllToDoListFromFolder);

todoRouter.post("/create-todo", createToDoList);
todoRouter.delete("/remove-todo/:id", removeToDoList);
