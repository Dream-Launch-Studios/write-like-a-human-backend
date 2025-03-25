"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import userRouter from "./routes/userRoutes";
// import groupRouter from "./routes/groupRoute";
// import documentRouter from "./routes/documentRoutes";
// import feedbackRouter from "./routes/feedbackRoutes";
// import commentRouter from "./routes/commentRoutes";
// import analysisRouter from "./routes/analysisRoutes";
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const analysis_routes_1 = __importDefault(require("./routes/analysis.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const word_suggestion_routes_1 = __importDefault(require("./routes/word-suggestion.routes"));
const group_routes_1 = __importDefault(require("./routes/group.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const submission_routes_1 = __importDefault(require("./routes/submission.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/analysis', analysis_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use("/api/comments", comment_routes_1.default);
app.use("/api/word-suggestions", word_suggestion_routes_1.default);
app.use("/api/groups", group_routes_1.default);
app.use("/api/assignments", assignment_routes_1.default);
app.use("/api/submissions", submission_routes_1.default);
// app.use("/api/groups", groupRouter); //completed
// app.use("/api/feedbacks", feedbackRouter);
// app.use("/api/comments", commentRouter);
// app.use("/api/users", userRouter); //completed
// app.use("/api/documents", documentRouter); //completed almost
// app.use("/api/analyze", analysisRouter);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
