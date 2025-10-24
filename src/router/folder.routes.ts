import { Hono } from "hono";
import {
  createFolder,
  getAllFolders,
  removeFolder,
} from "../controller/folder.controller.js";

export const folderRouter = new Hono();

folderRouter.get("/", getAllFolders);
folderRouter.post("/create-folder", createFolder);
folderRouter.delete("/remove-folder/:id", removeFolder);
