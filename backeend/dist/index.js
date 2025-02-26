"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const groupRoute_1 = __importDefault(require("./routes/groupRoute"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/groups", groupRoute_1.default);
app.use("/api/documents", documentRoutes_1.default);
app.use("/api/feedbacks", feedbackRoutes_1.default);
app.use("/api/comments", commentRoutes_1.default);
app.use("/api/analyze", analysisRoutes_1.default);
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
