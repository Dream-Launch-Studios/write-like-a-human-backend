"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementSubmissionCountMiddleware = exports.incrementAssignmentCountMiddleware = exports.incrementGroupCountMiddleware = exports.incrementDocumentCountMiddleware = exports.checkAIAnalysisAccessMiddleware = exports.checkSubmissionLimitMiddleware = exports.checkAssignmentLimitMiddleware = exports.checkGroupLimitMiddleware = exports.checkDocumentLimitMiddleware = exports.checkDocumentVersionLimitMiddleware = void 0;
const subscription_service_1 = require("../services/subscription.service");
const config_1 = __importDefault(require("../config/config"));
const subscriptionService = new subscription_service_1.SubscriptionService();
/**
 * Middleware to check if a user has reached their document version limit
 */
const checkDocumentVersionLimitMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const documentId = req.params.id;
        if (!userId || !documentId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized or missing document ID",
            });
            return;
        }
        const versionCount = await config_1.default.documentVersion.count({
            where: {
                rootDocumentId: documentId,
            },
        });
        const user = await config_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const limits = subscription_service_1.SUBSCRIPTION_LIMITS[user.subscriptionTier];
        if (versionCount >= limits.maxDocumentVersions) {
            res.status(403).json({
                success: false,
                message: `You have reached your document version limit of ${limits.maxDocumentVersions}. Please upgrade your subscription to create more versions.`,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking document version limit:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check document version limit",
        });
        return;
    }
};
exports.checkDocumentVersionLimitMiddleware = checkDocumentVersionLimitMiddleware;
/**
 * Middleware to check if a user has reached their document limit
 */
const checkDocumentLimitMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking document limit:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check document limit",
        });
        return;
    }
};
exports.checkDocumentLimitMiddleware = checkDocumentLimitMiddleware;
/**
 * Middleware to check if a user has reached their group limit
 */
const checkGroupLimitMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const canCreateGroup = await subscriptionService.checkUserLimits(userId, "maxGroups");
        if (!canCreateGroup) {
            res.status(403).json({
                success: false,
                message: "You have reached your group limit. Please upgrade your subscription to continue.",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking group limit:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check group limit",
        });
        return;
    }
};
exports.checkGroupLimitMiddleware = checkGroupLimitMiddleware;
/**
 * Middleware to check if a user has reached their assignment limit
 */
const checkAssignmentLimitMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const canCreateAssignment = await subscriptionService.checkUserLimits(userId, "maxAssignments");
        if (!canCreateAssignment) {
            res.status(403).json({
                success: false,
                message: "You have reached your assignment limit. Please upgrade your subscription to continue.",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking assignment limit:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check assignment limit",
        });
        return;
    }
};
exports.checkAssignmentLimitMiddleware = checkAssignmentLimitMiddleware;
/**
 * Middleware to check if a user has reached their submission limit
 */
const checkSubmissionLimitMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const canCreateSubmission = await subscriptionService.checkUserLimits(userId, "maxSubmissions");
        if (!canCreateSubmission) {
            res.status(403).json({
                success: false,
                message: "You have reached your submission limit. Please upgrade your subscription to continue.",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking submission limit:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check submission limit",
        });
        return;
    }
};
exports.checkSubmissionLimitMiddleware = checkSubmissionLimitMiddleware;
/**
 * Middleware to check if a user has access to AI analysis
 */
const checkAIAnalysisAccessMiddleware = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
    }
    catch (error) {
        console.error("Error checking AI analysis access:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to check AI analysis access",
        });
    }
};
exports.checkAIAnalysisAccessMiddleware = checkAIAnalysisAccessMiddleware;
/**
 * Middleware to increment document count when a new document is created
 */
const incrementDocumentCountMiddleware = async (req, res, next) => {
    var _a;
    const originalEnd = res.end;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next();
    }
    res.end = function (...args) {
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
exports.incrementDocumentCountMiddleware = incrementDocumentCountMiddleware;
/**
 * Middleware to increment group count when a new group is created
 */
const incrementGroupCountMiddleware = async (req, res, next) => {
    var _a;
    const originalEnd = res.end;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next();
    }
    res.end = function (...args) {
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
exports.incrementGroupCountMiddleware = incrementGroupCountMiddleware;
/**
 * Middleware to increment assignment count when a new assignment is created
 */
const incrementAssignmentCountMiddleware = async (req, res, next) => {
    var _a;
    const originalEnd = res.end;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next();
    }
    res.end = function (...args) {
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
exports.incrementAssignmentCountMiddleware = incrementAssignmentCountMiddleware;
/**
 * Middleware to increment submission count when a new submission is created
 */
const incrementSubmissionCountMiddleware = async (req, res, next) => {
    var _a;
    const originalEnd = res.end;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next();
    }
    res.end = function (...args) {
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
exports.incrementSubmissionCountMiddleware = incrementSubmissionCountMiddleware;
