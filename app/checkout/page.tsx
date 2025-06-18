'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CheckoutPageContent from './checkout-content';

// Loading component for Suspense fallback
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
