'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SubscriptionPageContent from './subscription-content';

// Loading component for Suspense fallback
function SubscriptionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading subscription...</p>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionLoading />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
