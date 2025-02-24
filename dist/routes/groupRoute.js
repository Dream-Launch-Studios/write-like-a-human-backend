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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController = __importStar(require("../controllers/groupController"));
const groupAuth_1 = require("../middleware/groupAuth");
const server_1 = require("../middleware/server");
const router = (0, express_1.Router)();
// Apply authentication middleware to all group routes
router.use(server_1.authenticateUser);
// Helper function to adapt controller to Express middleware
const adaptRoute = (controller) => {
    return (req, res, next) => {
        return Promise.resolve(controller(req, res)).catch(next);
    };
};
// Group management routes
router.post("/", adaptRoute(groupController.createGroup));
router.get("/", adaptRoute(groupController.listGroups));
router.get("/:id", groupAuth_1.checkGroupMembership, adaptRoute(groupController.getGroupDetails));
router.put("/:id", groupAuth_1.groupAdminAuth, adaptRoute(groupController.updateGroup));
router.delete("/:id", groupAuth_1.groupAdminAuth, adaptRoute(groupController.deleteGroup));
// Group member management routes
router.get("/:id/members", groupAuth_1.checkGroupMembership, adaptRoute(groupController.listGroupMembers));
router.post("/:id/members", groupAuth_1.groupAdminAuth, adaptRoute(groupController.addGroupMember));
router.delete("/:id/members/:userId", groupAuth_1.groupAdminAuth, adaptRoute(groupController.removeGroupMember));
// Group document routes
router.get("/:id/documents", groupAuth_1.checkGroupMembership, adaptRoute(groupController.getGroupDocuments));
// Join group with token
router.post("/join/:token", adaptRoute(groupController.joinGroupWithToken));
exports.default = router;
