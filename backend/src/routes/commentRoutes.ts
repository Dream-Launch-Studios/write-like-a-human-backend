// src/routes/commentRoutes.ts
import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as commentController from "../controllers/commentController";
import { authenticateUser } from "../middleware/server";

const commentRouter = Router();

const adaptRoute = (
  controller: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req as AuthenticatedRequest, res)).catch(
      next
    );
  };
};

commentRouter.use(authenticateUser);

commentRouter
  .route("/:id")
  .get(adaptRoute(commentController.getComment))
  .put(adaptRoute(commentController.updateComment))
  .delete(adaptRoute(commentController.deleteComment));

export default commentRouter;
