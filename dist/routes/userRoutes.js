"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const server_1 = require("../middleware/server");
const router = express_1.default.Router();
router.get("/:id", server_1.authenticateUser, userController_1.getUser);
router.put("/:id", server_1.authenticateUser, userController_1.updateUser);
router.get("/:id/documents", server_1.authenticateUser, userController_1.getUserDocuments);
exports.default = router;
