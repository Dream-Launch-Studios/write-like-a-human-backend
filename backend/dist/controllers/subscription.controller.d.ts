import { Request, Response } from "express";
export declare class SubscriptionController {
    /**
     * Get current user's subscription details
     */
    getCurrentSubscription(req: Request, res: Response): Promise<void>;
    /**
     * Upgrade to premium subscription
     */
    upgradeToPremium(req: Request, res: Response): Promise<void>;
    /**
     * Cancel subscription
     */
    cancelSubscription(req: Request, res: Response): Promise<void>;
    /**
     * Get payment history
     */
    getPaymentHistory(req: Request, res: Response): Promise<void>;
    /**
     * Create checkout session for subscription
     */
    createCheckoutSession(req: Request, res: Response): Promise<void>;
    /**
     * Handle Stripe webhook
     */
    handleWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get current usage stats
     */
    getUsageStats(req: Request, res: Response): Promise<void>;
    /**
     * Verify a checkout session
    */
    verifySession(req: Request, res: Response): Promise<void>;
    /**
    * Reactivate a subscription
    */
    reactivateSubscription(req: Request, res: Response): Promise<void>;
}
