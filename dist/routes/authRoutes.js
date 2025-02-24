"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const server_1 = require("../middleware/server");
const Authrouter = express_1.default.Router();
Authrouter.post("/register", authController_1.register);
Authrouter.post("/login", authController_1.login);
Authrouter.get("/me", server_1.authenticateUser, authController_1.getCurrentUser);
exports.default = Authrouter;
