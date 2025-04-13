import express from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { z } from "zod";

const router = express.Router();
const subscriptionController = new SubscriptionController();

const upgradeToPremiumSchema = z.object({
    paymentMethodId: z.string().min(1),
});

const cancelSubscriptionSchema = z.object({
    cancelAtPeriodEnd: z.boolean().default(true),
});

// Get current subscription
router.get(
    "/",
    authMiddleware,
    subscriptionController.getCurrentSubscription
);

// Upgrade to premium subscription
router.post(
    "/upgrade",
    authMiddleware,
    validate(upgradeToPremiumSchema),
    subscriptionController.upgradeToPremium
);

// Cancel subscription
router.post(
    "/cancel",
    authMiddleware,
    validate(cancelSubscriptionSchema),
    subscriptionController.cancelSubscription
);

// Get payment history
router.get(
    "/payments",
    authMiddleware,
    subscriptionController.getPaymentHistory
);

// Create checkout session
router.post(
    "/checkout",
    authMiddleware,
    subscriptionController.createCheckoutSession
);

// Get usage statistics
router.get(
    "/usage",
    authMiddleware,
    subscriptionController.getUsageStats
);


export default router;