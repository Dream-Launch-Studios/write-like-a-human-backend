import { Request, Response, NextFunction } from "express";
import { SubscriptionService, SUBSCRIPTION_LIMITS } from "../services/subscription.service";
import prisma from "../config/config";
const subscriptionService = new SubscriptionService();

/**
 * Middleware to check if a user has reached their document version limit
 */
export const checkDocumentVersionLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const documentId = req.params.id;

        if (!userId || !documentId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized or missing document ID",
            });
            return
        }

        const versionCount = await prisma.documentVersion.count({
            where: {
                rootDocumentId: documentId,
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return
        }

        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];


        if (versionCount >= limits.maxDocumentVersions) {
            res.status(403).json({
                success: false,
                message: `You have reached your document version limit of ${limits.maxDocumentVersions}. Please upgrade your subscription to create more versions.`,
            });
            return
        }

        next();
    } catch (error) {
        console.error("Error checking document version limit:", error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check document version limit",
        });
        return
    }
};


/**
 * Middleware to check if a user has reached their document limit
 */
export const checkDocumentLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const canCreateDocument = await subscriptionService.checkUserLimits(userId, "maxDocuments");

        if (!canCreateDocument) {
            res.status(403).json({
                success: false,
                message: "You have reached your document limit. Please upgrade your subscription to continue.",
            });
            return
        }

        next();
    } catch (error) {
        console.error("Error checking document limit:", error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check document limit",
        });
        return
    }
};

/**
 * Middleware to check if a user has reached their group limit
 */
export const checkGroupLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return
        }

        const canCreateGroup = await subscriptionService.checkUserLimits(userId, "maxGroups");

        if (!canCreateGroup) {
            res.status(403).json({
                success: false,
                message: "You have reached your group limit. Please upgrade your subscription to continue.",
            });
            return
        }

        next();
    } catch (error) {
        console.error("Error checking group limit:", error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check group limit",
        });
        return
    }
};

/**
 * Middleware to check if a user has reached their assignment limit
 */
export const checkAssignmentLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return
        }

        const canCreateAssignment = await subscriptionService.checkUserLimits(userId, "maxAssignments");

        if (!canCreateAssignment) {
            res.status(403).json({
                success: false,
                message: "You have reached your assignment limit. Please upgrade your subscription to continue.",
            });
            return
        }

        next();
    } catch (error) {
        console.error("Error checking assignment limit:", error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check assignment limit",
        });
        return
    }
};

/**
 * Middleware to check if a user has reached their submission limit
 */
export const checkSubmissionLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return
        }

        const canCreateSubmission = await subscriptionService.checkUserLimits(userId, "maxSubmissions");

        if (!canCreateSubmission) {
            res.status(403).json({
                success: false,
                message: "You have reached your submission limit. Please upgrade your subscription to continue.",
            });
            return
        }

        next();
    } catch (error) {
        console.error("Error checking submission limit:", error);
        res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check submission limit",
        });
        return
    }
};

/**
 * Middleware to check if a user has access to AI analysis
 */
export const checkAIAnalysisAccessMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const hasAIAnalysisAccess = await subscriptionService.checkUserLimits(userId, "hasAIAnalysis");

        if (!hasAIAnalysisAccess) {
            return res.status(403).json({
                success: false,
                message: "AI analysis is only available with paid subscriptions. Please upgrade to continue.",
            });
        }

        next();
    } catch (error) {
        console.error("Error checking AI analysis access:", error);
        return res.status(500).json({
            success: false,
            message: (error as Error).message || "Failed to check AI analysis access",
        });
    }
};

/**
 * Middleware to increment document count when a new document is created
 */
export const incrementDocumentCountMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const originalEnd = res.end;
    const userId = req.user?.id;

    if (!userId) {
        return next();
    }

    res.end = function (...args: any[]) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Only increment if the request is successful
            subscriptionService.incrementUserUsage(userId, "documentCount").catch(error => {
                console.error("Error incrementing document count:", error);
            });
        }
        // @ts-ignore
        return originalEnd.apply(res, args);
    };

    next();
};

/**
 * Middleware to increment group count when a new group is created
 */
export const incrementGroupCountMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const originalEnd = res.end;
    const userId = req.user?.id;

    if (!userId) {
        return next();
    }

    res.end = function (...args: any[]) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Only increment if the request is successful
            subscriptionService.incrementUserUsage(userId, "groupCount").catch(error => {
                console.error("Error incrementing group count:", error);
            });
        }
        // @ts-ignore
        return originalEnd.apply(res, args);
    };

    next();
};

/**
 * Middleware to increment assignment count when a new assignment is created
 */
export const incrementAssignmentCountMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const originalEnd = res.end;
    const userId = req.user?.id;

    if (!userId) {
        return next();
    }

    res.end = function (...args: any[]) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Only increment if the request is successful
            subscriptionService.incrementUserUsage(userId, "assignmentCount").catch(error => {
                console.error("Error incrementing assignment count:", error);
            });
        }
        // @ts-ignore
        return originalEnd.apply(res, args);
    };

    next();
};

/**
 * Middleware to increment submission count when a new submission is created
 */
export const incrementSubmissionCountMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const originalEnd = res.end;
    const userId = req.user?.id;

    if (!userId) {
        return next();
    }

    res.end = function (...args: any[]) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Only increment if the request is successful
            subscriptionService.incrementUserUsage(userId, "submissionCount").catch(error => {
                console.error("Error incrementing submission count:", error);
            });
        }
        // @ts-ignore
        return originalEnd.apply(res, args);
    };

    next();
};
