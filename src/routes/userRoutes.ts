import express from "express";
import {
  getUser,
  updateUser,
  getUserDocuments,
} from "../controllers/userController";
import { authenticateUser } from "../middleware/server";

const router = express.Router();

router.get("/:id", authenticateUser, getUser);
router.put("/:id", authenticateUser, updateUser);
router.get("/:id/documents", authenticateUser, getUserDocuments);

export default router;
