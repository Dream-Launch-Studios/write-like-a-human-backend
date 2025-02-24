// src/server.ts
import express from "express";
import Authrouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";

const app = express();

app.use(express.json());

app.use("/api/auth", Authrouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
