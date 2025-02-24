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
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        console.log("🔍 Verifying JWT token...");
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("✅ Token Decoded:", decoded);
        // Fetch user from database
        const user = yield config_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            console.log("❌ User not found in database");
            return res.status(404).json({ error: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log("❌ Authentication Error:", error.message);
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
});
exports.authenticateUser = authenticateUser;
