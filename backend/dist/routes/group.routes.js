"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const group_controller_1 = require("../controllers/group.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const group_schema_1 = require("../schemas/group.schema");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.post("/", (0, validate_middleware_1.validate)(group_schema_1.createGroupSchema), auth_middleware_1.teacherMiddleware, group_controller_1.createGroupController);
router.get("/", group_controller_1.getUserGroupsController);
router.get("/:id", (0, validate_middleware_1.validate)(group_schema_1.groupParamsSchema), group_controller_1.getGroupByIdController);
router.patch(":id", (0, validate_middleware_1.validate)(group_schema_1.updateGroupSchema), group_controller_1.updateGroupController);
router.delete("/:id", (0, validate_middleware_1.validate)(group_schema_1.groupParamsSchema), group_controller_1.deleteGroupController);
// Join group
router.post("/join/:token", (0, validate_middleware_1.validate)(group_schema_1.joinGroupSchema), group_controller_1.joinGroupController);
// Refresh join token
router.post("/:id/refresh-token", (0, validate_middleware_1.validate)(group_schema_1.groupParamsSchema), group_controller_1.refreshGroupTokenController);
// Group members
router.get("/:id/members", (0, validate_middleware_1.validate)(group_schema_1.groupParamsSchema), group_controller_1.getGroupMembersController);
router.post("/:id/members", (0, validate_middleware_1.validate)(group_schema_1.addGroupMemberSchema), group_controller_1.addGroupMemberController);
router.delete("/:id/members/:userId", (0, validate_middleware_1.validate)(group_schema_1.removeGroupMemberSchema), group_controller_1.removeGroupMemberController);
exports.default = router;
