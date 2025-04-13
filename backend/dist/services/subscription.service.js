"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.SUBSCRIPTION_LIMITS = void 0;
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const stripe_types_1 = require("../types/stripe.types");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
});
const SUBSCRIPTION_PRICES = {
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID,
    PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
};
exports.SUBSCRIPTION_LIMITS = {
    FREE: {
        maxDocuments: 5,
        maxGroups: 1,
        maxAssignments: 2,
        maxSubmissions: 5,
        hasAIAnalysis: false,
        hasPremiumSupport: false,
    },
    PREMIUM: {
        maxDocuments: 25,
        maxGroups: 5,
        maxAssignments: 10,
        maxSubmissions: 25,
        hasAIAnalysis: true,
        hasPremiumSupport: false,
    },
    PROFESSIONAL: {
        maxDocuments: 100,
        maxGroups: 20,
        maxAssignments: 50,
        maxSubmissions: 100,
        hasAIAnalysis: true,
        hasPremiumSupport: true,
    },
};
class SubscriptionService {
    /**
     * Create or update a Stripe customer for the user
     */
    async createOrUpdateStripeCustomer(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        if (user.stripeCustomerId) {
            return user;
        }
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
                userId: user.id,
                role: user.role,
            },
        });
        return prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
        });
    }
    /**
     * Create a subscription for a user
     */
    async createSubscription(userId, input) {
        if (input.tier === "FREE") {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: "FREE",
                    subscriptionTier: "FREE",
                },
            });
            return prisma.subscription.upsert({
                where: { userId },
                update: {
                    status: "FREE",
                    tier: "FREE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
                create: {
                    userId,
                    stripeCustomerId: "free_tier",
                    stripeSubscriptionId: "free_tier",
                    status: "FREE",
                    tier: "FREE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            });
        }
        const user = await this.createOrUpdateStripeCustomer(userId);
        if (!user.stripeCustomerId) {
            throw new Error("Failed to create Stripe customer");
        }
        if (!input.paymentMethodId) {
            throw new Error("Payment method is required for paid subscriptions");
        }
        try {
            await stripe.paymentMethods.attach(input.paymentMethodId, {
                customer: user.stripeCustomerId,
            });
            await stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: input.paymentMethodId,
                },
            });
            // Create the subscription in Stripe
            const stripeSubscription = await stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [
                    {
                        price: SUBSCRIPTION_PRICES[input.tier],
                    },
                ],
                payment_behavior: "default_incomplete",
                expand: ["latest_invoice.payment_intent"],
            });
            const subscription = await prisma.subscription.create({
                data: {
                    userId,
                    stripeCustomerId: user.stripeCustomerId,
                    stripeSubscriptionId: stripeSubscription.id,
                    status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
                    tier: input.tier,
                    currentPeriodStart: (0, stripe_types_1.getSubscriptionPeriodStart)(stripeSubscription),
                    currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(stripeSubscription),
                },
            });
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: this.mapStripeStatusToDbStatus(stripeSubscription.status),
                    subscriptionTier: input.tier,
                    subscriptionId: subscription.id,
                    currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(stripeSubscription),
                },
            });
            return subscription;
        }
        catch (error) {
            console.error("Error creating subscription:", error);
            throw new Error(`Failed to create subscription: ${error.message}`);
        }
    }
    /**
     * Update a user's subscription
     */
    async updateSubscription(userId, input) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user || !user.subscription) {
            throw new Error("User or subscription not found");
        }
        // If updating tier, handle with Stripe
        if (input.tier && input.tier !== user.subscriptionTier) {
            if (user.subscriptionTier === "FREE" && input.tier !== "FREE") {
                // Upgrading from free tier to paid tier, create new subscription
                return this.createSubscription(userId, { tier: input.tier });
            }
            else if (input.tier === "FREE") {
                // Downgrading to free tier, cancel existing subscription
                await this.cancelSubscription(userId, { cancelAtPeriodEnd: true });
                // Update user and subscription to free tier
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: "FREE",
                        subscriptionTier: "FREE",
                    },
                });
                return prisma.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        status: "FREE",
                        tier: "FREE",
                    },
                });
            }
            else {
                // Upgrading or downgrading between paid tiers
                try {
                    // Get the subscription from Stripe
                    const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
                    // Update the subscription in Stripe
                    await stripe.subscriptions.update(stripeSubscription.id, {
                        items: [
                            {
                                id: stripeSubscription.items.data[0].id,
                                price: SUBSCRIPTION_PRICES[input.tier],
                            },
                        ],
                    });
                    // Update the subscription in our database
                    const updatedSubscription = await prisma.subscription.update({
                        where: { id: user.subscription.id },
                        data: {
                            tier: input.tier,
                        },
                    });
                    // Update the user's subscription tier
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: input.tier,
                        },
                    });
                    return updatedSubscription;
                }
                catch (error) {
                    console.error("Error updating subscription tier:", error);
                    throw new Error(`Failed to update subscription: ${error.message}`);
                }
            }
        }
        // If updating cancelAtPeriodEnd
        if (input.cancelAtPeriodEnd !== undefined && user.subscription.stripeSubscriptionId !== "free_tier") {
            try {
                await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                    cancel_at_period_end: input.cancelAtPeriodEnd,
                });
                return prisma.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
                    },
                });
            }
            catch (error) {
                console.error("Error updating cancel at period end:", error);
                throw new Error(`Failed to update subscription: ${error.message}`);
            }
        }
        // If updating status
        if (input.status && input.status !== user.subscriptionStatus) {
            // This is typically handled by webhooks, but allow manual updates for admin purposes
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: input.status,
                },
            });
            return prisma.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    status: input.status,
                },
            });
        }
        return user.subscription;
    }
    /**
     * Cancel a user's subscription
     */
    async cancelSubscription(userId, input) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user || !user.subscription) {
            throw new Error("User or subscription not found");
        }
        if (user.subscription.stripeSubscriptionId === "free_tier") {
            return user.subscription;
        }
        try {
            if (input.cancelAtPeriodEnd) {
                await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });
                const updatedSubscription = await prisma.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        cancelAtPeriodEnd: true,
                    },
                });
                return updatedSubscription;
            }
            else {
                await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
                const updatedSubscription = await prisma.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        status: "CANCELED",
                        cancelAtPeriodEnd: false,
                    },
                });
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: "CANCELED",
                    },
                });
                return updatedSubscription;
            }
        }
        catch (error) {
            console.error("Error canceling subscription:", error);
            throw new Error(`Failed to cancel subscription: ${error.message}`);
        }
    }
    /**
     * Get a user's subscription
     */
    async getSubscription(userId) {
        return prisma.subscription.findUnique({
            where: { userId },
        });
    }
    /**
     * Get a user's subscription with payment history
     */
    async getSubscriptionWithPayments(userId) {
        return prisma.subscription.findUnique({
            where: { userId },
            include: {
                paymentHistory: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    }
    /**
     * Check if a user has reached their limits based on their subscription tier
     */
    async checkUserLimits(userId, limitType) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const limits = exports.SUBSCRIPTION_LIMITS[user.subscriptionTier];
        switch (limitType) {
            case "maxDocuments":
                return user.documentCount < limits.maxDocuments;
            case "maxGroups":
                return user.groupCount < limits.maxGroups;
            case "maxAssignments":
                return user.assignmentCount < limits.maxAssignments;
            case "maxSubmissions":
                return user.submissionCount < limits.maxSubmissions;
            case "hasAIAnalysis":
                return limits.hasAIAnalysis;
            case "hasPremiumSupport":
                return limits.hasPremiumSupport;
            default:
                return false;
        }
    }
    /**
     * Increment user's usage counter
     */
    async incrementUserUsage(userId, usageType) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                [usageType]: {
                    increment: 1,
                },
            },
        });
    }
    /**
     * Create a checkout session for subscription payment
     */
    async createCheckoutSession(userId, tier) {
        if (tier === "FREE") {
            throw new Error("Cannot create checkout session for free tier");
        }
        const user = await this.createOrUpdateStripeCustomer(userId);
        if (!user.stripeCustomerId) {
            throw new Error("Failed to create Stripe customer");
        }
        // Create a checkout session
        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: SUBSCRIPTION_PRICES[tier],
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
            metadata: {
                userId: userId,
                tier: tier,
                role: user.role
            },
        });
        return session.url || "";
    }
    /**
     * Handle Stripe webhook events
     */
    async handleWebhookEvent(event) {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case "invoice.payment_succeeded":
                await this.handleInvoicePaymentSucceeded(event.data.object);
                break;
            case "invoice.payment_failed":
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    /**
     * Handle subscription updated webhook
     */
    async handleSubscriptionUpdated(subscription) {
        const customerId = subscription.customer;
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        // Map the Stripe status to our status
        const status = this.mapStripeStatusToDbStatus(subscription.status);
        // Check if subscription exists in our database
        const existingSubscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });
        if (existingSubscription) {
            // Update existing subscription
            await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    status,
                    currentPeriodStart: (0, stripe_types_1.getSubscriptionPeriodStart)(subscription),
                    currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription),
                    cancelAtPeriodEnd: (0, stripe_types_1.getSubscriptionCancelAtPeriodEnd)(subscription),
                },
            });
        }
        else {
            // Create new subscription
            const tier = this.determineTierFromPrice(subscription);
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
                    status,
                    tier,
                    currentPeriodStart: (0, stripe_types_1.getSubscriptionPeriodStart)(subscription),
                    currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription),
                    cancelAtPeriodEnd: (0, stripe_types_1.getSubscriptionCancelAtPeriodEnd)(subscription),
                },
            });
        }
        // Update user's subscription status and end date
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: status,
                currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription),
            },
        });
    }
    /**
     * Handle subscription deleted webhook
     */
    async handleSubscriptionDeleted(subscription) {
        const customerId = subscription.customer;
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        // Update the subscription in our database
        const existingSubscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });
        if (existingSubscription) {
            await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    status: "CANCELED",
                },
            });
        }
        // Update user's subscription status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: "CANCELED",
                subscriptionTier: "FREE", // Revert to free tier when subscription is canceled
            },
        });
    }
    /**
     * Handle invoice payment succeeded webhook
     */
    async handleInvoicePaymentSucceeded(invoice) {
        const customerId = invoice.customer;
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id },
        });
        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }
        // Get payment intent ID safely
        const paymentIntentId = (0, stripe_types_1.getInvoicePaymentIntent)(invoice);
        const amount = (0, stripe_types_1.getInvoiceAmount)(invoice);
        const currency = (0, stripe_types_1.getInvoiceCurrency)(invoice);
        const receiptUrl = (0, stripe_types_1.getInvoiceReceiptUrl)(invoice);
        // Record the payment
        await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                stripePaymentId: invoice.id || '',
                amount: amount / 100, // Convert from cents to dollars
                currency: currency,
                status: "SUCCEEDED",
                paymentMethod: paymentIntentId, // Using payment_intent id as a reference
                receiptUrl: receiptUrl,
            },
        });
    }
    /**
     * Handle invoice payment failed webhook
     */
    async handleInvoicePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id },
        });
        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }
        // Get payment intent ID safely
        const paymentIntentId = (0, stripe_types_1.getInvoicePaymentIntent)(invoice);
        const amount = (0, stripe_types_1.getInvoiceAmount)(invoice);
        const currency = (0, stripe_types_1.getInvoiceCurrency)(invoice);
        // Record the failed payment
        await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                stripePaymentId: invoice.id || '',
                amount: amount / 100, // Convert from cents to dollars
                currency: currency,
                status: "FAILED",
                paymentMethod: paymentIntentId, // Using payment_intent id as a reference
            },
        });
        // Update subscription status
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: "PAST_DUE",
            },
        });
        // Update user subscription status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: "PAST_DUE",
            },
        });
    }
    /**
     * Map Stripe subscription status to our database status
     */
    mapStripeStatusToDbStatus(stripeStatus) {
        switch (stripeStatus) {
            case "active":
                return "ACTIVE";
            case "past_due":
                return "PAST_DUE";
            case "canceled":
                return "CANCELED";
            case "unpaid":
                return "UNPAID";
            case "trialing":
                return "TRIAL";
            default:
                return "FREE";
        }
    }
    /**
     * Determine subscription tier from Stripe price ID
     */
    determineTierFromPrice(subscription) {
        const priceId = subscription.items.data[0].price.id;
        if (priceId === SUBSCRIPTION_PRICES.PREMIUM) {
            return "PREMIUM";
        }
        else if (priceId === SUBSCRIPTION_PRICES.PROFESSIONAL) {
            return "PROFESSIONAL";
        }
        return "FREE"; // Default to free tier if unknown price ID
    }
}
exports.SubscriptionService = SubscriptionService;
