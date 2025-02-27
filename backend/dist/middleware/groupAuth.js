"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGroupMembership = exports.groupAdminAuth = void 0;
const config_1 = __importDefault(require("../config/config"));
const groupAdminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const group = yield config_1.default.group.findUnique({ where: { id: req.params.id } });
    if (!group) {
        res.status(404).json({ error: "Group not found" });
        return;
    }
    if (group.adminId !== user.id) {
        res.status(403).json({ error: "Not group admin" });
        return;
    }
    next();
});
exports.groupAdminAuth = groupAdminAuth;
const checkGroupMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.params.id;
    const user = req.user;
    const userId = user.id;
    const isMember = yield config_1.default.groupMember.findFirst({
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
});
exports.checkGroupMembership = checkGroupMembership;
