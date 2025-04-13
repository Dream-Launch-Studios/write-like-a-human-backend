"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionPeriodStart = getSubscriptionPeriodStart;
exports.getSubscriptionPeriodEnd = getSubscriptionPeriodEnd;
exports.getSubscriptionCancelAtPeriodEnd = getSubscriptionCancelAtPeriodEnd;
exports.getInvoicePaymentIntent = getInvoicePaymentIntent;
exports.getInvoiceAmount = getInvoiceAmount;
exports.getInvoiceCurrency = getInvoiceCurrency;
exports.getInvoiceReceiptUrl = getInvoiceReceiptUrl;
function getSubscriptionPeriodStart(subscription) {
    const timestamp = subscription.billing_cycle_anchor || subscription.start_date || Math.floor(Date.now() / 1000);
    return new Date(timestamp * 1000);
}
function getSubscriptionPeriodEnd(subscription) {
    const timestamp = subscription.cancel_at || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    return new Date(timestamp * 1000);
}
function getSubscriptionCancelAtPeriodEnd(subscription) {
    return subscription.cancel_at_period_end;
}
function getInvoicePaymentIntent(invoice) {
    if (invoice.payment_intent) {
        return typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : invoice.payment_intent.id;
    }
    if (invoice.payments && invoice.payments.data && invoice.payments.data.length > 0) {
        return invoice.payments.data[0].payment_intent || null;
    }
    return invoice.id || null;
}
function getInvoiceAmount(invoice) {
    return invoice.amount_paid || invoice.amount_due || 0;
}
function getInvoiceCurrency(invoice) {
    return invoice.currency;
}
function getInvoiceReceiptUrl(invoice) {
    return invoice.hosted_invoice_url || null;
}
