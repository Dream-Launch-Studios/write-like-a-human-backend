"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookEventSchema = exports.subscriptionResponseSchema = exports.cancelSubscriptionSchema = exports.updateSubscriptionSchema = exports.createSubscriptionSchema = exports.SubscriptionStatusEnum = exports.SubscriptionTierEnum = void 0;
const zod_1 = require("zod");
exports.SubscriptionTierEnum = zod_1.z.enum(["FREE", "PREMIUM"]);
exports.SubscriptionStatusEnum = zod_1.z.enum(["FREE", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID", "TRIAL"]);
exports.createSubscriptionSchema = zod_1.z.object({
    tier: exports.SubscriptionTierEnum,
    paymentMethodId: zod_1.z.string().optional(),
});
exports.updateSubscriptionSchema = zod_1.z.object({
    tier: exports.SubscriptionTierEnum.optional(),
    status: exports.SubscriptionStatusEnum.optional(),
    cancelAtPeriodEnd: zod_1.z.boolean().optional(),
});
exports.cancelSubscriptionSchema = zod_1.z.object({
    cancelAtPeriodEnd: zod_1.z.boolean().default(true),
});
exports.subscriptionResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    stripeCustomerId: zod_1.z.string(),
    stripeSubscriptionId: zod_1.z.string(),
    status: exports.SubscriptionStatusEnum,
    tier: exports.SubscriptionTierEnum,
    currentPeriodStart: zod_1.z.date(),
    currentPeriodEnd: zod_1.z.date(),
    cancelAtPeriodEnd: zod_1.z.boolean(),
});
exports.webhookEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    data: zod_1.z.object({
        object: zod_1.z.any(),
    }),
});
