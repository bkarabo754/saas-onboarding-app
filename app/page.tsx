import { HeroSection } from '@/components/landing-page/hero-section';
import { FeaturesGrid } from '@/components/landing-page/features-grid';
import { StatsSection } from '@/components/landing-page/stats-section';
import { TopRightUserControls } from '@/components/landing-page/UserControls';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopRightUserControls />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-16">
        <FeaturesGrid />
      </div>

      {/* Stats Section */}
      <StatsSection />
    </div>
  );
}
