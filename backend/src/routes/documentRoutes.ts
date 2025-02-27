// src/routes/documentRoutes.ts
import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as documentController from "../controllers/documentController";
import { authenticateUser } from "../middleware/server";

const documentRouter = Router();

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

documentRouter.use(authenticateUser);

documentRouter.get("/", adaptRoute(documentController.listDocuments));
documentRouter.post("/new", adaptRoute(documentController.createDocument));
documentRouter.get("/:id", adaptRoute(documentController.getDocument));
documentRouter.put("/:id/edit", adaptRoute(documentController.updateDocument));
documentRouter.get(
  "/:id/versions",
  adaptRoute(documentController.getDocumentVersions)
);
documentRouter.get(
  "/:id/analyze",
  adaptRoute(documentController.analyzeDocument)
);

export default documentRouter;
