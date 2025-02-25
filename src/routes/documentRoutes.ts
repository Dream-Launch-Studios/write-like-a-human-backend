// src/routes/documentRoutes.ts
import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as documentController from "../controllers/documentController";
import { authenticateUser } from "../middleware/server";

const router = Router();

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

router.use(authenticateUser);

router.get("/", adaptRoute(documentController.listDocuments));
router.post("/new", adaptRoute(documentController.createDocument));
router.get("/:id", adaptRoute(documentController.getDocument));
router.put("/:id/edit", adaptRoute(documentController.updateDocument));
router.get("/:id/versions", adaptRoute(documentController.getDocumentVersions));
router.get("/:id/analyze", adaptRoute(documentController.analyzeDocument));

export default router;
