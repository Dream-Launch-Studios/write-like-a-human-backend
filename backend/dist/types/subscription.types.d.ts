import { Subscription, Payment, SubscriptionStatus, SubscriptionTier, User, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { createSubscriptionSchema, updateSubscriptionSchema, cancelSubscriptionSchema } from "../schemas/subscription.schema";
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export interface SubscriptionWithUser extends Subscription {
    user: User;
}
export interface SubscriptionWithPayments extends Subscription {
    paymentHistory: Payment[];
}
export interface SubscriptionResponse {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}
export interface StripeWebhookEvent {
    id: string;
    type: string;
    data: {
        object: any;
    };
}
export interface SubscriptionLimits {
    maxDocuments: number;
    maxGroups: number;
    maxAssignments: number;
    maxSubmissions: number;
    hasAIAnalysis: boolean;
    hasPremiumSupport: boolean;
}
export interface UserUsage {
    documentCount: number;
    groupCount: number;
    assignmentCount: number;
    submissionCount: number;
}
export interface CreatePaymentInput {
    subscriptionId: string;
    stripePaymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    receiptUrl?: string;
}
export interface PaymentResponse {
    id: string;
    subscriptionId: string;
    stripePaymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    receiptUrl?: string;
    createdAt: Date;
}
