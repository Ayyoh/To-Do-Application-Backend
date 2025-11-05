import { Hono } from "hono";
import {
  getAllUsers,
  login,
  logout,
  meAuth,
  register,
} from "../controller/users.controller.js";

export const userRouter = new Hono();

userRouter.get("/", getAllUsers);
userRouter.get("/me", meAuth);

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.delete("/logout", logout);