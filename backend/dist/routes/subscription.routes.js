"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const zod_1 = require("zod");
const router = express_1.default.Router();
const subscriptionController = new subscription_controller_1.SubscriptionController();
const upgradeToPremiumSchema = zod_1.z.object({
    paymentMethodId: zod_1.z.string().min(1),
});
const cancelSubscriptionSchema = zod_1.z.object({
    cancelAtPeriodEnd: zod_1.z.boolean().default(true),
});
// Get current subscription
router.get("/", auth_middleware_1.authMiddleware, subscriptionController.getCurrentSubscription);
// Upgrade to premium subscription
router.post("/upgrade", auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(upgradeToPremiumSchema), subscriptionController.upgradeToPremium);
// Cancel subscription
router.post("/cancel", auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(cancelSubscriptionSchema), subscriptionController.cancelSubscription);
// Get payment history
router.get("/payments", auth_middleware_1.authMiddleware, subscriptionController.getPaymentHistory);
// Create checkout session
router.post("/checkout", auth_middleware_1.authMiddleware, subscriptionController.createCheckoutSession);
// Get usage statistics
router.get("/usage", auth_middleware_1.authMiddleware, subscriptionController.getUsageStats);
router.post("/verify-session", auth_middleware_1.authMiddleware, subscriptionController.verifySession);
router.post("/reactivate", auth_middleware_1.authMiddleware, subscriptionController.reactivateSubscription);
exports.default = router;
