"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGroupMembership = exports.groupAdminAuth = void 0;
const config_1 = __importDefault(require("../config/config"));
const groupAdminAuth = async (req, res, next) => {
    const user = req.user;
    const group = await config_1.default.group.findUnique({ where: { id: req.params.id } });
    if (!group) {
        res.status(404).json({ error: "Group not found" });
        return;
    }
    if (group.adminId !== user.id) {
        res.status(403).json({ error: "Not group admin" });
        return;
    }
    next();
};
exports.groupAdminAuth = groupAdminAuth;
const checkGroupMembership = async (req, res, next) => {
    const groupId = req.params.id;
    const user = req.user;
    const userId = user.id;
    const isMember = await config_1.default.groupMember.findFirst({
        where: {
            groupId,
            userId,
        },
    });
    if (!isMember) {
        res.status(403).json({ error: "Not a group member" });
        return;
    }
    next();
};
exports.checkGroupMembership = checkGroupMembership;
