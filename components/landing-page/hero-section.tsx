'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero section component for the landing page
 * Displays main value proposition and call-to-action buttons
 */
export function HeroSection() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        {/* Brand Header with Icon and Title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Onboarding
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IQ
            </span>
          </h1>
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to the Future of
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}
            SaaS
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Experience our intelligent onboarding that adapts to your needs,
          powered by AI to give you personalized recommendations and setup
          guidance.
        </p>

        {/* Call-to-Action Buttons */}
        <SignedOut>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mb-16">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </SignedIn>

        <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          <Image
            src="/createnewproject.png"
            alt="New Project preview"
            width={1100}
            height={600}
            className="rounded-xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}
