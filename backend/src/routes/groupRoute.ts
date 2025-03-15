import { Router } from "express";
import * as groupController from "../controllers/groupController";
import { groupAdminAuth, checkGroupMembership } from "../middleware/groupAuth";
import { authenticateUser } from "../middleware/server";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { authMiddleware } from "../middleware/auth";

const groupRouter = Router();


groupRouter.get('/test', authMiddleware, async (req: Request, res: Response) => {
  console.log(`🩸🩸🩸🩸req.user`)
  console.log(req.user)
  res.send({ok: "ok"})
})


// Apply authentication middleware to all group routes
// groupRouter.use(authenticateUser);

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
groupRouter.post("/", adaptRoute(groupController.createGroup));
groupRouter.get("/", adaptRoute(groupController.listGroups));
groupRouter.get(
  "/:id",
  checkGroupMembership,
  adaptRoute(groupController.getGroupDetails)
);
groupRouter.put(
  "/:id",
  groupAdminAuth,
  adaptRoute(groupController.updateGroup)
);
groupRouter.delete(
  "/:id",
  groupAdminAuth,
  adaptRoute(groupController.deleteGroup)
);

// Group member management routes
groupRouter.get(
  "/:id/members",
  checkGroupMembership,
  adaptRoute(groupController.listGroupMembers)
);
groupRouter.post(
  "/:id/members",
  groupAdminAuth,
  adaptRoute(groupController.addGroupMember)
);
groupRouter.delete(
  "/:id/members/:userId",
  groupAdminAuth,
  adaptRoute(groupController.removeGroupMember)
);

// Group document routes
groupRouter.get(
  "/:id/documents",
  checkGroupMembership,
  adaptRoute(groupController.getGroupDocuments)
);

// Join group with token
groupRouter.post(
  "/join/:token",
  adaptRoute(groupController.joinGroupWithToken)
);



export default groupRouter;
