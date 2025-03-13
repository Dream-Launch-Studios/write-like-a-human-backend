import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as analysisController from "../controllers/analysisController";
import { authenticateUser } from "../middleware/server";

const analysisRouter = Router();

/**
 * Helper function to wrap controller methods for error handling
 */
const adaptRoute = (
  controller: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req as AuthenticatedRequest, res)).catch(
      next
    );
  };
};

// Apply authentication middleware to all routes
analysisRouter.use(authenticateUser);

// Text analysis routes
analysisRouter.post("/text", adaptRoute(analysisController.analyzeRawText));

// Document analysis routes
analysisRouter.get(
  "/document/:id",
  adaptRoute(analysisController.analyzeDocument)
);
analysisRouter.post(
  "/document/compare",
  adaptRoute(analysisController.compareDocumentVersions)
);
analysisRouter.post(
  "/document/:id/suggestions",
  adaptRoute(analysisController.generateDocumentSuggestions)
);

// Feedback routes
analysisRouter.post("/feedback", adaptRoute(analysisController.saveFeedback));

export default analysisRouter;
