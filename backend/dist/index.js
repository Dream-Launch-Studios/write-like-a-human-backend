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
const supabase_1 = require("./utils/supabase");
const config_1 = __importDefault(require("./config/config"));
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
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.get('/verify-email', async (req, res) => {
    var _a;
    const token_hash = req.query.token_hash;
    const type = req.query.type;
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
        const { error, data } = await supabase_1.supabaseAdmin.auth.verifyOtp({
            type,
            token_hash,
        });
        if (error) {
            console.error("❌ OTP verification failed:", error);
            return res.redirect(`${CLIENT_URL}/error?message=otp-verification-failed`);
        }
        // Step 2: Get user ID from verification response
        const userId = (_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            console.error("❌ User ID not found in verification response");
            return res.redirect(`${CLIENT_URL}/error?message=user-not-found`);
        }
        console.log(`✅ OTP verified successfully for user ${userId}`);
        // Step 3: Verify user exists in database
        const userToVerify = await config_1.default.user.findUnique({
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
            await supabase_1.supabaseAdmin.auth.admin.updateUserById(userId, {
                email_confirm: true
            });
            console.log('✅ Email confirmed in Supabase');
            // Then update local database
            await config_1.default.user.update({
                where: { id: userId },
                data: { isEmailVerified: true }
            });
            console.log(`✅ Database updated successfully`);
            // Successful flow - redirect to login
            return res.redirect(`${CLIENT_URL}/auth/login`);
        }
        catch (updateError) {
            console.error('❌ Failed to update email verification:', updateError);
            return res.redirect(`${CLIENT_URL}/error?message=verification-update-failed`);
        }
    }
    catch (error) {
        // Catch any unexpected errors
        console.error("❌ Unexpected error during verification process:", error);
        return res.redirect(`${CLIENT_URL}/error?message=verification-process-error`);
    }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
