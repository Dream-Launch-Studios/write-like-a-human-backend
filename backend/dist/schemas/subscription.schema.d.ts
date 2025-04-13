import { z } from "zod";
export declare const SubscriptionTierEnum: z.ZodEnum<["FREE", "PREMIUM"]>;
export declare const SubscriptionStatusEnum: z.ZodEnum<["FREE", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID", "TRIAL"]>;
export declare const createSubscriptionSchema: z.ZodObject<{
    tier: z.ZodEnum<["FREE", "PREMIUM"]>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tier: "FREE" | "PREMIUM";
    paymentMethodId?: string | undefined;
}, {
    tier: "FREE" | "PREMIUM";
    paymentMethodId?: string | undefined;
}>;
export declare const updateSubscriptionSchema: z.ZodObject<{
    tier: z.ZodOptional<z.ZodEnum<["FREE", "PREMIUM"]>>;
    status: z.ZodOptional<z.ZodEnum<["FREE", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID", "TRIAL"]>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tier?: "FREE" | "PREMIUM" | undefined;
    status?: "FREE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIAL" | undefined;
    cancelAtPeriodEnd?: boolean | undefined;
}, {
    tier?: "FREE" | "PREMIUM" | undefined;
    status?: "FREE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIAL" | undefined;
    cancelAtPeriodEnd?: boolean | undefined;
}>;
export declare const cancelSubscriptionSchema: z.ZodObject<{
    cancelAtPeriodEnd: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cancelAtPeriodEnd: boolean;
}, {
    cancelAtPeriodEnd?: boolean | undefined;
}>;
export declare const subscriptionResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    stripeCustomerId: z.ZodString;
    stripeSubscriptionId: z.ZodString;
    status: z.ZodEnum<["FREE", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID", "TRIAL"]>;
    tier: z.ZodEnum<["FREE", "PREMIUM"]>;
    currentPeriodStart: z.ZodDate;
    currentPeriodEnd: z.ZodDate;
    cancelAtPeriodEnd: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tier: "FREE" | "PREMIUM";
    status: "FREE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIAL";
    cancelAtPeriodEnd: boolean;
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}, {
    tier: "FREE" | "PREMIUM";
    status: "FREE" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "TRIAL";
    cancelAtPeriodEnd: boolean;
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}>;
export declare const webhookEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    data: z.ZodObject<{
        object: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        object?: any;
    }, {
        object?: any;
    }>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    data: {
        object?: any;
    };
}, {
    type: string;
    id: string;
    data: {
        object?: any;
    };
}>;
