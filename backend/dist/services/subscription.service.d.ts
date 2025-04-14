import { Payment, Subscription, SubscriptionTier, User } from "@prisma/client";
import Stripe from "stripe";
import { CreateSubscriptionInput, UpdateSubscriptionInput, CancelSubscriptionInput, SubscriptionLimits } from "../types/subscription.types";
export declare const stripe: Stripe;
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
    getSubscriptionWithPayments(userId: string): Promise<Subscription & {
        paymentHistory: Payment[];
    } | null>;
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
        * Reactivate a subscription that was set to cancel at period end
    */
    reactivateSubscription(userId: string): Promise<Subscription>;
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
 * Handle checkout session completed webhook
 */
    private handleCheckoutSessionCompleted;
    /**
     * Determine subscription tier from Stripe price ID
     */
    private determineTierFromPrice;
    /**
     * Create a free subscription for a new user
     * Call this method when a new user is created
     */
    createFreeSubscriptionForNewUser(userId: string): Promise<Subscription>;
}
