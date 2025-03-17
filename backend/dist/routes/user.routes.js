"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const user_schema_1 = require("../schemas/user.schema");
const router = express_1.default.Router();
// Get list of users (admin only)
router.get('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(user_schema_1.listUsersSchema), userController.getUsers);
// Get a specific user
router.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(user_schema_1.getUserByIdSchema), userController.getUserById);
// Update user role (admin only)
router.patch('/:id/role', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(user_schema_1.updateUserRoleSchema), userController.updateUserRole);
exports.default = router;
