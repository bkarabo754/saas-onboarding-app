import Stripe from 'stripe';

// Make Stripe optional for demo purposes
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
} else {
  console.warn('STRIPE_SECRET_KEY not found - running in demo mode');
}

export { stripe };

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: 'price_free', // This would be a special case
    features: [
      'Up to 2 team members',
      'Basic analytics',
      'Community support',
      '1GB storage',
    ],
  },
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: [
      'Up to 5 team members',
      'Basic analytics',
      'Email support',
      '10GB storage',
    ],
  },
  professional: {
    name: 'Professional',
    price: 79,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    features: [
      'Up to 25 team members',
      'Advanced analytics',
      'Priority support',
      '100GB storage',
      'API access',
      'Custom integrations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: [
      'Unlimited team members',
      'Enterprise analytics',
      '24/7 phone support',
      'Unlimited storage',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
};
