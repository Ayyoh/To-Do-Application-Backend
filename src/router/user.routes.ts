import { Hono } from "hono";
import {
  getAllUsers,
  login,
  logout,
  register,
} from "../controller/users.controller.js";

export const userRouter = new Hono();

userRouter.get("/", getAllUsers);

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
