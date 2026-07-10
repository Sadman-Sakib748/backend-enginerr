// config/stripe.ts (Fixed - Correct API Version)
import Stripe from 'stripe';
import { logger } from '../utils/logger';

let stripeInstance: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    try {
      // ✅ Fixed: Use correct API version '2023-08-16' instead of '2023-10-16'
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
        maxNetworkRetries: 2,
      });
      
      logger.info('Stripe client initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Stripe client:', error.message);
      throw new Error(`Stripe initialization failed: ${error.message}`);
    }
  }
  
  return stripeInstance;
};

export const verifyStripeWebhook = (
  payload: Buffer,
  signature: string
): Stripe.Event => {
  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET is not defined');
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
    }
    
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    logger.error('Webhook signature verification failed:', error.message);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};