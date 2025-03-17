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
const groupController = __importStar(require("../controllers/groupController"));
const groupAuth_1 = require("../middleware/groupAuth");
const auth_middleware_1 = require("../middleware/auth.middleware");
const groupRouter = (0, express_1.Router)();
groupRouter.get('/test', auth_middleware_1.authMiddleware, auth_middleware_1.studentMiddleware, async (req, res) => {
    console.log(`🩸🩸🩸🩸req.user`);
    console.log(req.user);
    res.send({ user: req.user });
});
// Apply authentication middleware to all group routes
// groupRouter.use(authenticateUser);
// Helper function to adapt controller to Express middleware
const adaptRoute = (controller) => {
    return (req, res, next) => {
        return Promise.resolve(controller(req, res)).catch(next);
    };
};
// Group management routes
groupRouter.post("/", adaptRoute(groupController.createGroup));
groupRouter.get("/", adaptRoute(groupController.listGroups));
groupRouter.get("/:id", groupAuth_1.checkGroupMembership, adaptRoute(groupController.getGroupDetails));
groupRouter.put("/:id", groupAuth_1.groupAdminAuth, adaptRoute(groupController.updateGroup));
groupRouter.delete("/:id", groupAuth_1.groupAdminAuth, adaptRoute(groupController.deleteGroup));
// Group member management routes
groupRouter.get("/:id/members", groupAuth_1.checkGroupMembership, adaptRoute(groupController.listGroupMembers));
groupRouter.post("/:id/members", groupAuth_1.groupAdminAuth, adaptRoute(groupController.addGroupMember));
groupRouter.delete("/:id/members/:userId", groupAuth_1.groupAdminAuth, adaptRoute(groupController.removeGroupMember));
// Group document routes
groupRouter.get("/:id/documents", groupAuth_1.checkGroupMembership, adaptRoute(groupController.getGroupDocuments));
// Join group with token
groupRouter.post("/join/:token", adaptRoute(groupController.joinGroupWithToken));
exports.default = groupRouter;
