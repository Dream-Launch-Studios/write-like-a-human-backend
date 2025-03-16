import express from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listUsersSchema, getUserByIdSchema, updateUserRoleSchema } from '../schemas/user.schema';

const router = express.Router();

// Get list of users (admin only)
router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    validate(listUsersSchema),
    userController.getUsers
);

// Get a specific user
router.get(
    '/:id',
    authMiddleware,
    validate(getUserByIdSchema),
    userController.getUserById
);

// Update user role (admin only)
router.patch(
    '/:id/role',
    authMiddleware,
    adminMiddleware,
    validate(updateUserRoleSchema),
    userController.updateUserRole
);

export default router;