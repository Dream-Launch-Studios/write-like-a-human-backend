import Stripe from 'stripe';

export function getSubscriptionPeriodStart(subscription: Stripe.Subscription): Date {
  const timestamp = subscription.billing_cycle_anchor || subscription.start_date || Math.floor(Date.now() / 1000);
  return new Date(timestamp * 1000);
}

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  const timestamp = subscription.cancel_at || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
  return new Date(timestamp * 1000);
}

export function getSubscriptionCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean {
  return subscription.cancel_at_period_end;
}

export function getInvoicePaymentIntent(invoice: Stripe.Invoice): string | null {
  if ((invoice as any).payment_intent) {
    return typeof (invoice as any).payment_intent === 'string'
      ? (invoice as any).payment_intent
      : (invoice as any).payment_intent.id;
  }
  
  if ((invoice as any).payments && (invoice as any).payments.data && (invoice as any).payments.data.length > 0) {
    return (invoice as any).payments.data[0].payment_intent || null;
  }
  
  return invoice.id || null;
}

export function getInvoiceAmount(invoice: Stripe.Invoice): number {
  return invoice.amount_paid || invoice.amount_due || 0;
}

export function getInvoiceCurrency(invoice: Stripe.Invoice): string {
  return invoice.currency;
}

export function getInvoiceReceiptUrl(invoice: Stripe.Invoice): string | null {
  return invoice.hosted_invoice_url || null;
}