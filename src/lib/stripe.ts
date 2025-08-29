import Stripe from 'stripe';

// Initialize Stripe with environment check
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Create a dummy stripe instance for build time if no key is provided
export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      // Use a stable, currently available API version
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return !!stripeSecretKey;
};

// Helper function to get stripe instance safely
export const getStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
};

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  priceId: process.env.STRIPE_PRICE_ID || 'price_premium_monthly',
  currency: 'eur',
  premiumPlan: {
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited AI analysis',
      'Advanced tactical insights',
      'Real-time match updates',
      'Betting recommendations',
      'Priority support'
    ]
  }
};

export async function createCheckoutSession(userId: string, email: string) {
  const stripeInstance = getStripe();
  const session = await stripeInstance.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: STRIPE_CONFIG.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const stripeInstance = getStripe();
  const session = await stripeInstance.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.subscriptions.cancel(subscriptionId);
} 