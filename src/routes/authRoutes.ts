import express from "express";
import { getCurrentUser, login, register } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getCurrentUser);

export default router;
