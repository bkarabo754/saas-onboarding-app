import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Welcome to the Future of
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {' '}
          SaaS
        </span>
      </h1>

      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Experience our intelligent onboarding that adapts to your needs, powered
        by AI to give you personalized recommendations and setup guidance.
      </p>

      <SignedOut>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg cursor-pointer"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg cursor-pointer"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="mb-16">
          <Link href="/onboarding">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg cursor-pointer"
            >
              Continue Onboarding
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </SignedIn>
    </>
  );
};

export default HeroSection;
