import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import submissionRoutes from "./routes/submissionRoutes";
import userRoutes from "./routes/userRoutes";
import rubricRoutes from "./routes/rubricRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rubrics", rubricRoutes);

// Error handling
app.use(errorHandler);

export default app;
