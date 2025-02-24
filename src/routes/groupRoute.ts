import { Router } from "express";
import * as groupController from "../controllers/groupController";
import { groupAdminAuth, checkGroupMembership } from "../middleware/groupAuth";
import { authenticateUser } from "../middleware/server";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Apply authentication middleware to all group routes
router.use(authenticateUser);

// Helper function to adapt controller to Express middleware
const adaptRoute = (
  controller: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req as AuthenticatedRequest, res)).catch(
      next
    );
  };
};

// Group management routes
router.post("/", adaptRoute(groupController.createGroup));
router.get("/", adaptRoute(groupController.listGroups));
router.get(
  "/:id",
  checkGroupMembership,
  adaptRoute(groupController.getGroupDetails)
);
router.put("/:id", groupAdminAuth, adaptRoute(groupController.updateGroup));
router.delete("/:id", groupAdminAuth, adaptRoute(groupController.deleteGroup));

// Group member management routes
router.get(
  "/:id/members",
  checkGroupMembership,
  adaptRoute(groupController.listGroupMembers)
);
router.post(
  "/:id/members",
  groupAdminAuth,
  adaptRoute(groupController.addGroupMember)
);
router.delete(
  "/:id/members/:userId",
  groupAdminAuth,
  adaptRoute(groupController.removeGroupMember)
);

// Group document routes
router.get(
  "/:id/documents",
  checkGroupMembership,
  adaptRoute(groupController.getGroupDocuments)
);

// Join group with token
router.post("/join/:token", adaptRoute(groupController.joinGroupWithToken));

export default router;
