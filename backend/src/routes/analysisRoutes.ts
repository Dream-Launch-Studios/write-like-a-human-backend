import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as analysisController from "../controllers/analysisController";
import { authenticateUser } from "../middleware/server";

const analysisRouter = Router();

const adaptRoute = (
  controller: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req as AuthenticatedRequest, res)).catch(
      next
    );
  };
};

analysisRouter.use(authenticateUser);

analysisRouter.post("/text", adaptRoute(analysisController.analyzeRawText));
analysisRouter.get(
  "/document/:id",
  adaptRoute(analysisController.analyzeDocument)
);

export default analysisRouter;
