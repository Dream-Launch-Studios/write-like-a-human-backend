import express from "express";
import { getCurrentUser, login, register } from "../controllers/authController";
import { authenticateUser } from "../middleware/server";

const Authrouter = express.Router();

Authrouter.post("/register", register);
Authrouter.post("/login", login);
Authrouter.get("/me", authenticateUser, getCurrentUser);

export default Authrouter;
