import express from "express";
import Authrouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import groupRouter from "./routes/groupRoute";
import documentRouter from "./routes/documentRoutes";
import feedbackRouter from "./routes/feedbackRoutes";
import commentRouter from "./routes/commentRoutes";
import analysisRouter from "./routes/analysisRoutes";

const app = express();

app.use(express.json());

app.use("/api/auth", Authrouter);
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/documents", documentRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/comments", commentRouter);
app.use("/api/analyze", analysisRouter);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
