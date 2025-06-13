import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, PRICING_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, successUrl, cancelUrl } = await request.json();

    // Get plan details
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // For demo purposes, we'll simulate the checkout process
    // In production, this would create a real Stripe checkout session

    if (planId === 'free') {
      // Handle free plan "checkout" - just redirect to success
      return NextResponse.json({
        sessionId: 'free_plan',
        redirectUrl: successUrl || `/subscription?success=true&plan=${planId}`,
      });
    }

    // Simulate Stripe checkout session creation
    const sessionId = `cs_demo_${Date.now()}_${planId}`;

    // In production with real Stripe, you would create a session like this:
    /*
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
        metadata: {
          userId,
          planId,
        },
        customer_email: user?.emailAddresses[0]?.emailAddress,
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
        },
      });
      
      return NextResponse.json({ 
        sessionId: session.id,
        redirectUrl: session.url,
        planDetails: {
          name: plan.name,
          price: plan.price,
          features: plan.features
        }
      });
    }
    */

    // Demo mode - simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      sessionId,
      redirectUrl: `/checkout?session_id=${sessionId}&plan=${planId}`,
      planDetails: {
        name: plan.name,
        price: plan.price,
        features: plan.features,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
