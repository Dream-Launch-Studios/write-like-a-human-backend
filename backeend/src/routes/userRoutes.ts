import express from "express";
import {
  getUser,
  updateUser,
  getUserDocuments,
} from "../controllers/userController";
import { authenticateUser } from "../middleware/server";

const userRouter = express.Router();

userRouter.get("/:id", authenticateUser, getUser);
userRouter.put("/:id", authenticateUser, updateUser);
userRouter.get("/:id/documents", authenticateUser, getUserDocuments);

export default userRouter;
