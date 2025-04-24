import Stripe from 'stripe';
export declare function getSubscriptionPeriodStart(subscription: Stripe.Subscription): Date;
export declare function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date;
export declare function getSubscriptionCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean;
export declare function getInvoicePaymentIntent(invoice: Stripe.Invoice): string | null;
export declare function getInvoiceAmount(invoice: Stripe.Invoice): number;
export declare function getInvoiceCurrency(invoice: Stripe.Invoice): string;
export declare function getInvoiceReceiptUrl(invoice: Stripe.Invoice): string | null;
