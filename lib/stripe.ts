import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    price: 79,
    priceId: 'price_1RZ7IkRVBeCqOOHCSzG83rLU',
    features: [
      'Up to 5 team members',
      'Basic analytics',
      'Email support',
      '10GB storage',
    ],
  },
  professional: {
    name: 'Professional',
    price: 120,
    priceId: 'price_1RZ7MmRVBeCqOOHCQvtvKdiY',
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
    price: 350,
    priceId: 'price_1RZ7PNRVBeCqOOHCSJBiF0kW',
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
