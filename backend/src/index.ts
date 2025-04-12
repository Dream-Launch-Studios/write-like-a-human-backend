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
import { createClient, EmailOtpType } from "@supabase/supabase-js";
import { supabaseAdmin } from "./utils/supabase";
import prisma from "./config/config";

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

app.get("/", (req, res) => {
  res.send("API is running...");
});


app.get('/verify-email', async (req, res): Promise<void> => {
  const token_hash = req.query.token_hash as string | undefined;
  const type = req.query.type as EmailOtpType | undefined;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

  // Validate required environment variables
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    console.error("❌ SUPABASE_JWT_SECRET is not set");
    return res.redirect(`${CLIENT_URL}/error?message=server-configuration-error`);
  }

  // Validate required query parameters
  if (!token_hash || !type) {
    console.error("❌ Missing required parameters: token_hash or type");
    return res.redirect(`${CLIENT_URL}/error?message=missing-parameters`);
  }

  try {
    // Step 1: Verify the OTP with Supabase
    console.log(`🔍 Verifying OTP token for type: ${type}`);
    const { error, data } = await supabaseAdmin.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("❌ OTP verification failed:", error);
      return res.redirect(`${CLIENT_URL}/error?message=otp-verification-failed`);
    }

    // Step 2: Get user ID from verification response
    const userId = data?.user?.id;
    if (!userId) {
      console.error("❌ User ID not found in verification response");
      return res.redirect(`${CLIENT_URL}/error?message=user-not-found`);
    }
    console.log(`✅ OTP verified successfully for user ${userId}`);

    // Step 3: Verify user exists in database
    const userToVerify = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToVerify) {
      console.error(`❌ User not found in database: ${userId}`);
      return res.redirect(`${CLIENT_URL}/error?message=user-not-found-in-db`);
    }

    console.log(`✅ User found in database:`, {
      id: userToVerify.id,
      email: userToVerify.email,
      currentVerificationStatus: userToVerify.isEmailVerified
    });

    // Step 4: Update Supabase and local database
    try {
      // Update Supabase first
      console.log(`🔄 Updating Supabase email verification for user ${userId}`);
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
      console.log('✅ Email confirmed in Supabase');

      // Then update local database
      await prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true }
      });
      console.log(`✅ Database updated successfully`);

      // Successful flow - redirect to login
      return res.redirect(`${CLIENT_URL}/auth/login`);
    } catch (updateError) {
      console.error('❌ Failed to update email verification:', updateError);
      return res.redirect(`${CLIENT_URL}/error?message=verification-update-failed`);
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error("❌ Unexpected error during verification process:", error);
    return res.redirect(`${CLIENT_URL}/error?message=verification-process-error`);
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app