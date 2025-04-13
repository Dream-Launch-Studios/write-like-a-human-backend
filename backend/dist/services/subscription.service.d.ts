import { Subscription, SubscriptionTier, User } from "@prisma/client";
import { CreateSubscriptionInput, UpdateSubscriptionInput, CancelSubscriptionInput, SubscriptionLimits } from "../types/subscription.types";
export declare const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits>;
export declare class SubscriptionService {
    /**
     * Create or update a Stripe customer for the user
     */
    createOrUpdateStripeCustomer(userId: string): Promise<User>;
    /**
     * Create a subscription for a user
     */
    createSubscription(userId: string, input: CreateSubscriptionInput): Promise<Subscription>;
    /**
     * Update a user's subscription
     */
    updateSubscription(userId: string, input: UpdateSubscriptionInput): Promise<Subscription>;
    /**
     * Cancel a user's subscription
     */
    cancelSubscription(userId: string, input: CancelSubscriptionInput): Promise<Subscription>;
    /**
     * Get a user's subscription
     */
    getSubscription(userId: string): Promise<Subscription | null>;
    /**
     * Get a user's subscription with payment history
     */
    getSubscriptionWithPayments(userId: string): Promise<Subscription | null>;
    /**
     * Check if a user has reached their limits based on their subscription tier
     */
    checkUserLimits(userId: string, limitType: keyof SubscriptionLimits): Promise<boolean>;
    /**
     * Increment user's usage counter
     */
    incrementUserUsage(userId: string, usageType: "documentCount" | "groupCount" | "assignmentCount" | "submissionCount"): Promise<User>;
    /**
     * Create a checkout session for subscription payment
     */
    createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<string>;
    /**
     * Handle Stripe webhook events
     */
    handleWebhookEvent(event: any): Promise<void>;
    /**
     * Handle subscription updated webhook
     */
    private handleSubscriptionUpdated;
    /**
     * Handle subscription deleted webhook
     */
    private handleSubscriptionDeleted;
    /**
     * Handle invoice payment succeeded webhook
     */
    private handleInvoicePaymentSucceeded;
    /**
     * Handle invoice payment failed webhook
     */
    private handleInvoicePaymentFailed;
    /**
     * Map Stripe subscription status to our database status
     */
    private mapStripeStatusToDbStatus;
    /**
     * Determine subscription tier from Stripe price ID
     */
    private determineTierFromPrice;
}
