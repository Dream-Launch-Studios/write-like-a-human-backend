import express from "express";
import {
    createGroupController,
    getUserGroupsController,
    getGroupByIdController,
    updateGroupController,
    deleteGroupController,
    joinGroupController,
    getGroupMembersController,
    addGroupMemberController,
    removeGroupMemberController,
    refreshGroupTokenController,
} from "../controllers/group.controller";
import {
    adminMiddleware,
    authMiddleware,
    teacherMiddleware,
} from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
    createGroupSchema,
    updateGroupSchema,
    groupParamsSchema,
    joinGroupSchema,
    addGroupMemberSchema,
    removeGroupMemberSchema,
} from "../schemas/group.schema";

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/",
    validate(createGroupSchema),
    adminMiddleware,
    teacherMiddleware,
    createGroupController
);

router.get("/", getUserGroupsController);

router.get("/:id", validate(groupParamsSchema), getGroupByIdController);

router.patch(":id", validate(updateGroupSchema), updateGroupController);

router.delete("/:id", validate(groupParamsSchema), deleteGroupController);

// Join group
router.post("/join/:token", validate(joinGroupSchema), joinGroupController);

// Refresh join token
router.post(
    "/:id/refresh-token",
    validate(groupParamsSchema),
    refreshGroupTokenController
);

// Group members
router.get(
    "/:id/members",
    validate(groupParamsSchema),
    getGroupMembersController
);

router.post(
    "/:id/members",
    validate(addGroupMemberSchema),
    addGroupMemberController
);

router.delete(
    "/:id/members/:userId",
    validate(removeGroupMemberSchema),
    removeGroupMemberController
);

export default router;
