'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  price: number;
  className?: string;
  children?: React.ReactNode;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CheckoutButton({
  planId,
  planName,
  price,
  className,
  children,
  variant = 'default',
  size = 'default',
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // For free plan, redirect directly to success
      if (planId === 'free' || price === 0) {
        toast.success('Welcome to the Free plan!');
        router.push(`/subscription?success=true&plan=${planId}`);
        return;
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/subscription?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to checkout page
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        throw new Error('No redirect URL provided');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const defaultContent = (
    <>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : price === 0 ? (
        <Crown className="h-4 w-4 mr-2" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {price === 0 ? 'Get Started Free' : `Subscribe to ${planName}`}
    </>
  );

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {children || defaultContent}
    </Button>
  );
}
