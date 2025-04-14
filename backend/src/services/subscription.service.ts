// services/subscription.service.ts
import { Payment, PrismaClient, Subscription, SubscriptionStatus, SubscriptionTier, User } from "@prisma/client";
import Stripe from "stripe";
import { CreateSubscriptionInput, UpdateSubscriptionInput, CancelSubscriptionInput, SubscriptionLimits } from "../types/subscription.types";
import {
    getSubscriptionPeriodStart,
    getSubscriptionPeriodEnd,
    getSubscriptionCancelAtPeriodEnd,
    getInvoicePaymentIntent,
    getInvoiceAmount,
    getInvoiceCurrency,
    getInvoiceReceiptUrl
} from "../types/stripe.types";
import prisma from "../config/config";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-03-31.basil", // Using the specified API version
});

// Subscription pricing and product IDs - update these with your actual Stripe product IDs
const SUBSCRIPTION_PRICES = {
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID as string,
};

// Define limits for each subscription tier
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
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

export class SubscriptionService {
    /**
     * Create or update a Stripe customer for the user
     */
    async createOrUpdateStripeCustomer(userId: string): Promise<User> {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error("User not found");
        }

        // If user already has a Stripe customer ID, return the user
        if (user.stripeCustomerId) {
            return user;
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
                userId: user.id,
            },
        });

        // Update user with Stripe customer ID
        return prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
        });
    }

    /**
     * Create a subscription for a user
     */
    async createSubscription(userId: string, input: CreateSubscriptionInput): Promise<Subscription> {
        // Only proceed if user is selecting a paid tier
        if (input.tier === "FREE") {
            // For free tier, just update the user's subscription status
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: "FREE",
                    subscriptionTier: "FREE",
                },
            });

            // Return the default free subscription
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
            await stripe.paymentMethods.attach(input.paymentMethodId, {
                customer: user.stripeCustomerId,
            });

            // Set it as the default payment method
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

            // Create the subscription in our database
            const subscription = await prisma.subscription.create({
                data: {
                    userId,
                    stripeCustomerId: user.stripeCustomerId,
                    stripeSubscriptionId: stripeSubscription.id,
                    status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
                    tier: input.tier,
                    currentPeriodStart: getSubscriptionPeriodStart(stripeSubscription),
                    currentPeriodEnd: getSubscriptionPeriodEnd(stripeSubscription),
                },
            });

            // Update the user's subscription status
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: this.mapStripeStatusToDbStatus(stripeSubscription.status),
                    subscriptionTier: input.tier,
                    subscriptionId: subscription.id,
                    currentPeriodEnd: getSubscriptionPeriodEnd(stripeSubscription),
                },
            });

            return subscription;
        } catch (error) {
            console.error("Error creating subscription:", error);
            throw new Error(`Failed to create subscription: ${(error as Error).message}`);
        }
    }

    /**
     * Update a user's subscription
     */
    async updateSubscription(userId: string, input: UpdateSubscriptionInput): Promise<Subscription> {
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
            } else if (input.tier === "FREE") {
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
            } else {
                // Upgrading or downgrading between paid tiers
                try {
                    // Get the subscription from Stripe
                    const stripeSubscription = await stripe.subscriptions.retrieve(
                        user.subscription.stripeSubscriptionId
                    );

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
                } catch (error) {
                    console.error("Error updating subscription tier:", error);
                    throw new Error(`Failed to update subscription: ${(error as Error).message}`);
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
            } catch (error) {
                console.error("Error updating cancel at period end:", error);
                throw new Error(`Failed to update subscription: ${(error as Error).message}`);
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
    async cancelSubscription(userId: string, input: CancelSubscriptionInput): Promise<Subscription> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!user || !user.subscription) {
            throw new Error("User or subscription not found");
        }

        // If it's a free tier subscription, nothing to cancel in Stripe
        if (user.subscription.stripeSubscriptionId === "free_tier") {
            console.log(`it's a free tier subscription, nothing to cancel in Stripe`)
            return user.subscription;
        }

        try {
            if (input.cancelAtPeriodEnd) {
                console.log(`🚑 Cancelling at period end`)
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
            } else {
                console.log(`🚑 Cancelling immediately`)
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
        } catch (error) {
            console.error("Error canceling subscription:", error);
            throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
        }
    }

    /**
     * Get a user's subscription
     */
    async getSubscription(userId: string): Promise<Subscription | null> {
        return prisma.subscription.findUnique({
            where: { userId },
        });
    }

    /**
     * Get a user's subscription with payment history
     */
    async getSubscriptionWithPayments(userId: string): Promise<Subscription & { paymentHistory: Payment[] } | null> {
        return prisma.subscription.findUnique({
            where: { userId },
            include: {
                paymentHistory: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        }) as Promise<(Subscription & { paymentHistory: Payment[] }) | null>;
    }

    /**
     * Check if a user has reached their limits based on their subscription tier
     */
    async checkUserLimits(userId: string, limitType: keyof SubscriptionLimits): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error("User not found");
        }

        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];

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
    async incrementUserUsage(userId: string, usageType: "documentCount" | "groupCount" | "assignmentCount" | "submissionCount"): Promise<User> {
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
    async createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<string> {
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
            },
        });

        return session.url || "";
    }

    /**
        * Reactivate a subscription that was set to cancel at period end
    */
    async reactivateSubscription(userId: string): Promise<Subscription> {
        const user = await prisma.user.findUnique({
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

        if (user?.subscription.status === "CANCELED") {
            throw new Error("Subscription has already been canceled");
        }

        try {
            await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });

            const updatedSubscription = await prisma.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    cancelAtPeriodEnd: false,
                },
            });

            return updatedSubscription;
        } catch (error) {
            console.error("Error reactivating subscription:", error);
            throw new Error(`Failed to reactivate subscription: ${(error as Error).message}`);
        }
    }



    /**
     * Handle Stripe webhook events
     */
    async handleWebhookEvent(event: any): Promise<void> {
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
    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        console.log(`💙 Stripe webhook event handler - handleSubscriptionUpdated`);
        console.log(`💙 subscription (from args): ${JSON.stringify(subscription)}`);
        const customerId = subscription.customer as string;
        console.log(`customerId: ${customerId}`);

        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });

        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }

        const status = this.mapStripeStatusToDbStatus(subscription.status);
        const tier = this.determineTierFromPrice(subscription);
        console.log(`💘 status: ${status}`);
        console.log(`tier -> ${tier}`)

        const existingSubscription = await prisma.subscription.findFirst({
            where: { userId: user.id },
        });
        console.log(`💘 existingSubscription: ${JSON.stringify(existingSubscription)}`)

        if (existingSubscription) {
            console.log("🍎 existingSubscription found")
            const currentPeriodStart = getSubscriptionPeriodStart(subscription)
            const currentPeriodEnd = getSubscriptionPeriodEnd(subscription)
            const cancelAtPeriodEnd = getSubscriptionCancelAtPeriodEnd(subscription)
            console.log(`🍎 currentPeriodStart - ${currentPeriodStart}`)
            console.log(`🍎 currentPeriodEnd - ${currentPeriodEnd}`)
            console.log(`🍎 cancelAtPeriodEnd - ${cancelAtPeriodEnd}`)
            await prisma.subscription.update({
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
        } else {
            console.log("🍎 NO existingSubscription found, creating new subscription")
            const tier = this.determineTierFromPrice(subscription);
            console.log(`tier - ${tier}`)
            const currentPeriodStart = getSubscriptionPeriodStart(subscription)
            const currentPeriodEnd = getSubscriptionPeriodEnd(subscription)
            const cancelAtPeriodEnd = getSubscriptionCancelAtPeriodEnd(subscription)
            await prisma.subscription.create({
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
        console.log(`Update user's subscription status and end date -> ${getSubscriptionPeriodEnd(subscription)}`)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: status,
                subscriptionTier: tier,
                currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
            },
        });
    }

    /**
     * Handle subscription deleted webhook
     */
    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        console.log(`🍎 handleSubscriptionDelete webhook`)
        const customerId = subscription.customer as string;
        console.log(`customerId - ${customerId}`)

        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });

        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }

        const existingSubscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });

        console.log(`🍎 existingSubscription - ${JSON.stringify(existingSubscription)}}`)

        if (existingSubscription) {
            console.log(`🍎 existingSubscription found`)
            await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                    status: "CANCELED",
                },
            });
        }

        console.log(`Update user's subscription status`)
        await prisma.user.update({
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
    private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
        console.log(`🍎 handleInvoicePaymentSucceeded run`)
        console.log(`🍎 invoice (from params) 👇`)
        console.log(invoice)
        const customerId = invoice.customer as string;
        console.log(`customerId - ${customerId}`)

        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });

        console.log(`user -> ${JSON.stringify(user)}`)

        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }

        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id },
        });

        console.log(`subscription -> ${JSON.stringify(subscription)}`)
        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }


        const paymentIntentId = getInvoicePaymentIntent(invoice);
        const amount = getInvoiceAmount(invoice);
        const currency = getInvoiceCurrency(invoice);
        const receiptUrl = getInvoiceReceiptUrl(invoice);

        console.log(`paymentIntentId -> ${paymentIntentId}`)
        console.log(`amount -> ${amount}`)
        console.log(`amount / 100 -> ${amount / 100}`)
        console.log(`currency -> ${currency}`)
        console.log(`receiptUrl -> ${receiptUrl}`)

        // Record the payment
        await prisma.payment.create({
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
    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        console.log(`🍎 handleInvoicePaymentFailed run`)
        console.log(`🍎 invoice (from params) 👇`)
        console.log(invoice)
        const customerId = invoice.customer as string;
        console.log(`customerId - ${customerId}`)

        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });

        console.log(`user - ${user}`)

        if (!user) {
            console.error(`No user found for Stripe customer ID: ${customerId}`);
            return;
        }

        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id },
        });

        console.log(`🍎 subscription -> ${subscription}`)

        if (!subscription) {
            console.error(`No subscription found for user ID: ${user.id}`);
            return;
        }

        // Get payment intent ID safely
        const paymentIntentId = getInvoicePaymentIntent(invoice);
        const amount = getInvoiceAmount(invoice);
        const currency = getInvoiceCurrency(invoice);

        console.log(`paymentIntentId - ${paymentIntentId}`)
        console.log(`amount - ${amount}`)
        console.log(`amount / 100 - ${amount / 100}`)
        console.log(`currency - ${currency}`)

        await prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                stripePaymentId: invoice.id || '',
                amount: amount / 100,
                currency: currency,
                status: "FAILED",
                paymentMethod: paymentIntentId,
            },
        });

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: "PAST_DUE",
            },
        });

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
    private mapStripeStatusToDbStatus(stripeStatus: string): SubscriptionStatus {
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
    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
        console.log(`🍎 handleCheckoutSessionCompleted run`);

        // Extract the user ID from the metadata
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as SubscriptionTier;
        console.log(`🍎 tier - ${tier}`);

        if (!userId) {
            console.error('No userId found in session metadata');
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return;
        }

        // The subscription should be updated through the subscription.created event
        // This is just a backup to ensure the user's subscription tier is updated
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: tier || "PREMIUM",
            },
        });
    }


    /**
     * Determine subscription tier from Stripe price ID
     */
    private determineTierFromPrice(subscription: Stripe.Subscription): SubscriptionTier {
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
    async createFreeSubscriptionForNewUser(userId: string): Promise<Subscription> {
        // Check if user already has a subscription
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId },
        });

        if (existingSubscription) {
            return existingSubscription; // User already has a subscription
        }

        // Create free tier subscription
        return prisma.subscription.create({
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