import express from "express";
import cors from "cors";
// import userRouter from "./routes/userRoutes";
// import groupRouter from "./routes/groupRoute";
// import documentRouter from "./routes/documentRoutes";
// import feedbackRouter from "./routes/feedbackRoutes";
// import commentRouter from "./routes/commentRoutes";
// import analysisRouter from "./routes/analysisRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/user.routes";
import documentRoutes from "./routes/document.routes";
import analysisRoutes from "./routes/analysis.routes";
import feedbackRoutes from "./routes/feedback.routes";
import commentRoutes from "./routes/comment.routes";
import wordSuggestionRoutes from "./routes/word-suggestion.routes";
import groupRoutes from "./routes/group.routes";
import assignmentRoutes from "./routes/assignment.routes";
import submissionRoutes from "./routes/submission.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/word-suggestions", wordSuggestionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);

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


export default app