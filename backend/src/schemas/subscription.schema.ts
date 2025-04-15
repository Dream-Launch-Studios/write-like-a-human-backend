import { z } from "zod";

export const SubscriptionTierEnum = z.enum(["FREE", "PREMIUM"]);
export const SubscriptionStatusEnum = z.enum(["FREE", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID", "TRIAL"]);

export const createSubscriptionSchema = z.object({
  tier: SubscriptionTierEnum,
  paymentMethodId: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  tier: SubscriptionTierEnum.optional(),
  status: SubscriptionStatusEnum.optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
});

export const subscriptionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stripeCustomerId: z.string(),
  stripeSubscriptionId: z.string(),
  status: SubscriptionStatusEnum,
  tier: SubscriptionTierEnum,
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
});

export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});