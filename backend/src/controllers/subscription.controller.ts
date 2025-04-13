// controllers/subscription.controller.ts
import { Request, Response } from "express";
import { SUBSCRIPTION_LIMITS, SubscriptionService } from "../services/subscription.service";
import { CreateSubscriptionInput, UpdateSubscriptionInput, CancelSubscriptionInput } from "../types/subscription.types";
import prisma from "../config/config";

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
    /**
     * Get current user's subscription details
     */
    async getCurrentSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const subscription = await subscriptionService.getSubscription(userId);

            res.status(200).json({
                success: true,
                data: subscription,
            });
        } catch (error) {
            console.error("Error getting subscription:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to get subscription details",
            });
        }
    }

    /**
     * Upgrade to premium subscription
     */
    async upgradeToPremium(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const { paymentMethodId } = req.body;

            if (!paymentMethodId) {
                res.status(400).json({
                    success: false,
                    message: "Payment method ID is required",
                });
            }

            const subscription = await subscriptionService.createSubscription(userId, {
                tier: "PREMIUM",
                paymentMethodId,
            });

            res.status(200).json({
                success: true,
                data: subscription,
            });
        } catch (error) {
            console.error("Error upgrading subscription:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to upgrade subscription",
            });
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const { cancelAtPeriodEnd = true } = req.body;

            const subscription = await subscriptionService.cancelSubscription(userId, {
                cancelAtPeriodEnd,
            });

            res.status(200).json({
                success: true,
                data: subscription,
                message: cancelAtPeriodEnd
                    ? "Your subscription will be canceled at the end of the billing period"
                    : "Your subscription has been canceled immediately",
            });
        } catch (error) {
            console.error("Error canceling subscription:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to cancel subscription",
            });
        }
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const subscriptionWithPayments = await subscriptionService.getSubscriptionWithPayments(userId);

            if (!subscriptionWithPayments) {
                res.status(404).json({
                    success: false,
                    message: "No subscription found",
                });
            }

            res.status(200).json({
                success: true,
                data: subscriptionWithPayments?.paymentHistory || [],
            });
        } catch (error) {
            console.error("Error getting payment history:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to get payment history",
            });
        }
    }

    /**
     * Create checkout session for subscription
     */
    async createCheckoutSession(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const sessionUrl = await subscriptionService.createCheckoutSession(userId, "PREMIUM");

            res.status(200).json({
                success: true,
                data: { url: sessionUrl },
            });
        } catch (error) {
            console.error("Error creating checkout session:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to create checkout session",
            });
        }
    }

    /**
     * Handle Stripe webhook
     */
    async handleWebhook(req: Request, res: Response): Promise<any> {
        const sig = req.headers["stripe-signature"] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

        if (!sig || !endpointSecret) {
            return res.status(400).json({
                success: false,
                message: "Missing Stripe signature or endpoint secret",
            });
        }

        let event;

        try {
            const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (error) {
            console.error("Error verifying webhook signature:", error);
            return res.status(400).json({
                success: false,
                message: `Webhook signature verification failed: ${(error as Error).message}`,
            });
        }

        try {
            await subscriptionService.handleWebhookEvent(event);
            return res.status(200).json({ received: true });
        } catch (error) {
            console.error("Error handling webhook event:", error);
            return res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to handle webhook event",
            });
        }
    }

    /**
     * Get current usage stats
     */
    async getUsageStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    documentCount: true,
                    groupCount: true,
                    assignmentCount: true,
                    submissionCount: true,
                    subscriptionTier: true,
                },
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return
            }

            const limits = SUBSCRIPTION_LIMITS[user?.subscriptionTier!];

            res.status(200).json({
                success: true,
                data: {
                    usage: {
                        documents: user.documentCount,
                        groups: user.groupCount,
                        assignments: user.assignmentCount,
                        submissions: user.submissionCount,
                    },
                    limits: {
                        maxDocuments: limits.maxDocuments,
                        maxGroups: limits.maxGroups,
                        maxAssignments: limits.maxAssignments,
                        maxSubmissions: limits.maxSubmissions,
                        maxDocumentVersions: limits.maxDocumentVersions,
                    },
                    percentages: {
                        documents: Math.round((user.documentCount / limits.maxDocuments) * 100),
                        groups: Math.round((user.groupCount / limits.maxGroups) * 100),
                        assignments: Math.round((user.assignmentCount / limits.maxAssignments) * 100),
                        submissions: Math.round((user.submissionCount / limits.maxSubmissions) * 100),
                    },
                },
            });
        } catch (error) {
            console.error("Error getting usage stats:", error);
            res.status(500).json({
                success: false,
                message: (error as Error).message || "Failed to get usage statistics",
            });
        }
    }
}