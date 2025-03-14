"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController = __importStar(require("../controllers/feedbackController"));
const server_1 = require("../middleware/server");
const feedbackRouter = (0, express_1.Router)();
const adaptRoute = (controller) => {
    return (req, res, next) => {
        return Promise.resolve(controller(req, res)).catch(next);
    };
};
feedbackRouter.use(server_1.authenticateUser);
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
exports.default = feedbackRouter;
