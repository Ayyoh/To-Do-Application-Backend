import { Hono } from "hono";
import {
  createToDoList,
  getAllToDoList,
  removeToDoList,
} from "../controller/todo.controller.js";

export const todoRouter = new Hono();

todoRouter.get("/", getAllToDoList);
todoRouter.post("/create-todo", createToDoList);
todoRouter.delete("/remove-todo/:id", removeToDoList);
