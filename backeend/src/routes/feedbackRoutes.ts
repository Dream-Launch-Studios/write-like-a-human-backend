import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as feedbackController from "../controllers/feedbackController";
import { authenticateUser } from "../middleware/server";

const feedbackRouter = Router();

const adaptRoute = (
  controller: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req as AuthenticatedRequest, res)).catch(
      next
    );
  };
};

feedbackRouter.use(authenticateUser);

feedbackRouter.post("/", adaptRoute(feedbackController.createFeedback));
feedbackRouter
  .route("/:id")
  .get(adaptRoute(feedbackController.getFeedback))
  .put(adaptRoute(feedbackController.updateFeedback))
  .delete(adaptRoute(feedbackController.deleteFeedback));

feedbackRouter
  .route("/:id/comments")
  .get(adaptRoute(feedbackController.getFeedbackComments))
  .post(adaptRoute(feedbackController.addComment));

export default feedbackRouter;
