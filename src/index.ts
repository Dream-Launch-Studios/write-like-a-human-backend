// src/server.ts
import express from "express";
import Authrouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import groupRouter from "./routes/groupRoute";

const app = express();

app.use(express.json());

app.use("/api/auth", Authrouter);
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
