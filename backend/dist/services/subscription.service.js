"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.SUBSCRIPTION_LIMITS = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe_types_1 = require("../types/stripe.types");
const config_1 = __importDefault(require("../config/config"));
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil", // Using the specified API version
});
// Subscription pricing and product IDs - update these with your actual Stripe product IDs
const SUBSCRIPTION_PRICES = {
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID,
};
// Define limits for each subscription tier
exports.SUBSCRIPTION_LIMITS = {
    FREE: {
        maxDocuments: 5,
        maxGroups: 1,
        maxAssignments: 2,
        maxSubmissions: 5,
        maxDocumentVersions: 2,
        hasAIAnalysis: true,
        hasPremiumSupport: false,
    },
    PREMIUM: {
        maxDocuments: 25,
        maxGroups: 5,
        maxAssignments: 10,
        maxSubmissions: 25,
        maxDocumentVersions: 10,
        hasAIAnalysis: true,
        hasPremiumSupport: true,
    },
};
class SubscriptionService {
    /**
     * Create or update a Stripe customer for the user
     */
    async createOrUpdateStripeCustomer(userId) {
        const user = await config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        // If user already has a Stripe customer ID, return the user
        if (user.stripeCustomerId) {
            return user;
        }
        // Create new Stripe customer
        const customer = await exports.stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
                userId: user.id,
            },
        });
        // Update user with Stripe customer ID
        return config_1.default.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
        });
    }
    /**
     * Create a subscription for a user
     */
    async createSubscription(userId, input) {
        // Only proceed if user is selecting a paid tier
        if (input.tier === "FREE") {
            // For free tier, just update the user's subscription status
            await config_1.default.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: "FREE",
                    subscriptionTier: "FREE",
                },
            });
            // Return the default free subscription
            return config_1.default.subscription.upsert({
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
        // For paid tiers, create or update the Stripe customer
        const user = await this.createOrUpdateStripeCustomer(userId);
        if (!user.stripeCustomerId) {
            throw new Error("Failed to create Stripe customer");
        }
        if (!input.paymentMethodId) {
            throw new Error("Payment method is required for paid subscriptions");
        }
        try {
            // Attach the payment method to the customer
            await exports.stripe.paymentMethods.attach(input.paymentMethodId, {
                customer: user.stripeCustomerId,
            });
            // Set it as the default payment method
            await exports.stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: input.paymentMethodId,
                },
            });
            // Create the subscription in Stripe
            const stripeSubscription = await exports.stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [
                    {
                        price: SUBSCRIPTION_PRICES[input.tier],
                    },
                ],
                payment_behavior: "default_incomplete",
                expand: ["latest_invoice.payment_intent"],
            });
            // Create the subscription in our database
            const subscription = await config_1.default.subscription.create({
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
            // Update the user's subscription status
            await config_1.default.user.update({
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
        const user = await config_1.default.user.findUnique({
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
                await config_1.default.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: "FREE",
                        subscriptionTier: "FREE",
                    },
                });
                return config_1.default.subscription.update({
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
                    const stripeSubscription = await exports.stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
                    // Update the subscription in Stripe
                    await exports.stripe.subscriptions.update(stripeSubscription.id, {
                        items: [
                            {
                                id: stripeSubscription.items.data[0].id,
                                price: SUBSCRIPTION_PRICES[input.tier],
                            },
                        ],
                    });
                    // Update the subscription in our database
                    const updatedSubscription = await config_1.default.subscription.update({
                        where: { id: user.subscription.id },
                        data: {
                            tier: input.tier,
                        },
                    });
                    // Update the user's subscription tier
                    await config_1.default.user.update({
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
                await exports.stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                    cancel_at_period_end: input.cancelAtPeriodEnd,
                });
                return config_1.default.subscription.update({
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
            await config_1.default.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: input.status,
                },
            });
            return config_1.default.subscription.update({
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
        const user = await config_1.default.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user || !user.subscription) {
            throw new Error("User or subscription not found");
        }
        // If it's a free tier subscription, nothing to cancel in Stripe
        if (user.subscription.stripeSubscriptionId === "free_tier") {
            console.log(`it's a free tier subscription, nothing to cancel in Stripe`);
            return user.subscription;
        }
        try {
            if (input.cancelAtPeriodEnd) {
                console.log(`🚑 Cancelling at period end`);
                await exports.stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });
                const updatedSubscription = await config_1.default.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        cancelAtPeriodEnd: true,
                    },
                });
                return updatedSubscription;
            }
            else {
                console.log(`🚑 Cancelling immediately`);
                await exports.stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
                const updatedSubscription = await config_1.default.subscription.update({
                    where: { id: user.subscription.id },
                    data: {
                        status: "CANCELED",
                        cancelAtPeriodEnd: false,
                    },
                });
                await config_1.default.user.update({
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
        return config_1.default.subscription.findUnique({
            where: { userId },
        });
    }
    /**
     * Get a user's subscription with payment history
     */
    async getSubscriptionWithPayments(userId) {
        return config_1.default.subscription.findUnique({
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
        const user = await config_1.default.user.findUnique({ where: { id: userId } });
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
        return config_1.default.user.update({
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
        const session = await exports.stripe.checkout.sessions.create({
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
            },
        });
        return session.url || "";
    }
    /**
        * Reactivate a subscription that was set to cancel at period end
    */
    async reactivateSubscription(userId) {
        const user = await config_1.default.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user || !user.subscription) {
            throw new Error("User or subscription not found");
        }
        // Can only reactivate subscriptions that are set to cancel at period end
        // and haven't actually expired yet
        if (!user.subscription.cancelAtPeriodEnd) {
            throw new Error("Subscription is not set to cancel at period end");
        }
        if ((user === null || user === void 0 ? void 0 : user.subscription.status) === "CANCELED") {
            throw new Error("Subscription has already been canceled");
        }
        try {
            await exports.stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });
            const updatedSubscription = await config_1.default.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    cancelAtPeriodEnd: false,
                },
            });
            return updatedSubscription;
        }
        catch (error) {
            console.error("Error reactivating subscription:", error);
            throw new Error(`Failed to reactivate subscription: ${error.message}`);
        }
    }
    /**
     * Handle Stripe webhook events
     */
    async handleWebhookEvent(event) {
        console.log(`💙 Stripe webhook event - ${event.type}`);
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
            case "checkout.session.completed":
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    /**
     * Handle subscription updated webhook
     */
    async handleSubscriptionUpdated(subscription) {
        console.log(`💙 Stripe webhook event handler - handleSubscriptionUpdated`);
        console.log(`💙 subscription (from args): ${JSON.stringify(subscription)}`);
        const customerId = subscription.customer;
        console.log(`customerId: ${customerId}`);
        const user = await config_1.default.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const status = this.mapStripeStatusToDbStatus(subscription.status);
        const tier = this.determineTierFromPrice(subscription);
        console.log(`💘 status: ${status}`);
        console.log(`tier -> ${tier}`);
        const existingSubscription = await config_1.default.subscription.findFirst({
            where: { userId: user.id },
        });
        console.log(`💘 existingSubscription: ${JSON.stringify(existingSubscription)}`);
        if (existingSubscription) {
            console.log("🍎 existingSubscription found");
            const currentPeriodStart = (0, stripe_types_1.getSubscriptionPeriodStart)(subscription);
            const currentPeriodEnd = (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription);
            const cancelAtPeriodEnd = (0, stripe_types_1.getSubscriptionCancelAtPeriodEnd)(subscription);
            console.log(`🍎 currentPeriodStart - ${currentPeriodStart}`);
            console.log(`🍎 currentPeriodEnd - ${currentPeriodEnd}`);
            console.log(`🍎 cancelAtPeriodEnd - ${cancelAtPeriodEnd}`);
            await config_1.default.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: customerId,
                    status,
                    tier,
                    currentPeriodStart,
                    currentPeriodEnd,
                    cancelAtPeriodEnd,
                },
            });
        }
        else {
            console.log("🍎 NO existingSubscription found, creating new subscription");
            const tier = this.determineTierFromPrice(subscription);
            console.log(`tier - ${tier}`);
            const currentPeriodStart = (0, stripe_types_1.getSubscriptionPeriodStart)(subscription);
            const currentPeriodEnd = (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription);
            const cancelAtPeriodEnd = (0, stripe_types_1.getSubscriptionCancelAtPeriodEnd)(subscription);
            await config_1.default.subscription.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
                    status,
                    tier,
                    currentPeriodStart,
                    currentPeriodEnd,
                    cancelAtPeriodEnd,
                },
            });
        }
        // Update user's subscription status and end date
        console.log(`Update user's subscription status and end date -> ${(0, stripe_types_1.getSubscriptionPeriodEnd)(subscription)}`);
        await config_1.default.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: status,
                subscriptionTier: tier,
                currentPeriodEnd: (0, stripe_types_1.getSubscriptionPeriodEnd)(subscription),
            },
        });
    }
    /**
     * Handle subscription deleted webhook
     */
    async handleSubscriptionDeleted(subscription) {
        console.log(`🍎 handleSubscriptionDelete webhook`);
        const customerId = subscription.customer;
        console.log(`customerId - ${customerId}`);
        const user = await config_1.default.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const existingSubscription = await config_1.default.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });
        console.log(`🍎 existingSubscription - ${JSON.stringify(existingSubscription)}}`);
        if (existingSubscription) {
            console.log(`🍎 existingSubscription found`);
            await config_1.default.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    status: "CANCELED",
                },
            });
        }
        console.log(`Update user's subscription status`);
        await config_1.default.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: "CANCELED",
                subscriptionTier: "FREE",
            },
        });
    }
    /**
     * Handle invoice payment succeeded webhook
     */
    async handleInvoicePaymentSucceeded(invoice) {
        console.log(`🍎 handleInvoicePaymentSucceeded run`);
        console.log(`🍎 invoice (from params) 👇`);
        console.log(invoice);
        const customerId = invoice.customer;
        console.log(`customerId - ${customerId}`);
        const user = await config_1.default.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        console.log(`user -> ${JSON.stringify(user)}`);
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const subscription = await config_1.default.subscription.findFirst({
            where: { userId: user.id },
        });
        console.log(`subscription -> ${JSON.stringify(subscription)}`);
        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }
        const paymentIntentId = (0, stripe_types_1.getInvoicePaymentIntent)(invoice);
        const amount = (0, stripe_types_1.getInvoiceAmount)(invoice);
        const currency = (0, stripe_types_1.getInvoiceCurrency)(invoice);
        const receiptUrl = (0, stripe_types_1.getInvoiceReceiptUrl)(invoice);
        console.log(`paymentIntentId -> ${paymentIntentId}`);
        console.log(`amount -> ${amount}`);
        console.log(`amount / 100 -> ${amount / 100}`);
        console.log(`currency -> ${currency}`);
        console.log(`receiptUrl -> ${receiptUrl}`);
        // Record the payment
        await config_1.default.payment.create({
            data: {
                subscriptionId: subscription.id,
                stripePaymentId: invoice.id || '',
                amount: amount / 100,
                currency: currency,
                status: "SUCCEEDED",
                paymentMethod: paymentIntentId,
                receiptUrl: receiptUrl,
            },
        });
    }
    /**
     * Handle invoice payment failed webhook
     */
    async handleInvoicePaymentFailed(invoice) {
        console.log(`🍎 handleInvoicePaymentFailed run`);
        console.log(`🍎 invoice (from params) 👇`);
        console.log(invoice);
        const customerId = invoice.customer;
        console.log(`customerId - ${customerId}`);
        const user = await config_1.default.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        console.log(`user - ${user}`);
        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }
        const subscription = await config_1.default.subscription.findFirst({
            where: { userId: user.id },
        });
        console.log(`🍎 subscription -> ${subscription}`);
        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }
        // Get payment intent ID safely
        const paymentIntentId = (0, stripe_types_1.getInvoicePaymentIntent)(invoice);
        const amount = (0, stripe_types_1.getInvoiceAmount)(invoice);
        const currency = (0, stripe_types_1.getInvoiceCurrency)(invoice);
        console.log(`paymentIntentId - ${paymentIntentId}`);
        console.log(`amount - ${amount}`);
        console.log(`amount / 100 - ${amount / 100}`);
        console.log(`currency - ${currency}`);
        await config_1.default.payment.create({
            data: {
                subscriptionId: subscription.id,
                stripePaymentId: invoice.id || '',
                amount: amount / 100,
                currency: currency,
                status: "FAILED",
                paymentMethod: paymentIntentId,
            },
        });
        await config_1.default.subscription.update({
            where: { id: subscription.id },
            data: {
                status: "PAST_DUE",
            },
        });
        await config_1.default.user.update({
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
 * Handle checkout session completed webhook
 */
    async handleCheckoutSessionCompleted(session) {
        var _a, _b;
        console.log(`🍎 handleCheckoutSessionCompleted run`);
        // Extract the user ID from the metadata
        const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        const tier = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.tier;
        console.log(`🍎 tier - ${tier}`);
        if (!userId) {
            console.error('No userId found in session metadata');
            return;
        }
        const user = await config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return;
        }
        // The subscription should be updated through the subscription.created event
        // This is just a backup to ensure the user's subscription tier is updated
        await config_1.default.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: tier || "PREMIUM",
            },
        });
    }
    /**
     * Determine subscription tier from Stripe price ID
     */
    determineTierFromPrice(subscription) {
        const priceId = subscription.items.data[0].price.id;
        if (priceId === SUBSCRIPTION_PRICES.PREMIUM) {
            return "PREMIUM";
        }
        return "FREE"; // Default to free tier if unknown price ID
    }
    /**
     * Create a free subscription for a new user
     * Call this method when a new user is created
     */
    async createFreeSubscriptionForNewUser(userId) {
        // Check if user already has a subscription
        const existingSubscription = await config_1.default.subscription.findUnique({
            where: { userId },
        });
        if (existingSubscription) {
            return existingSubscription; // User already has a subscription
        }
        // Create free tier subscription
        return config_1.default.subscription.create({
            data: {
                userId,
                stripeCustomerId: "free_tier",
                stripeSubscriptionId: "free_tier",
                status: "FREE",
                tier: "FREE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now for free tier
            },
        });
    }
}
exports.SubscriptionService = SubscriptionService;
