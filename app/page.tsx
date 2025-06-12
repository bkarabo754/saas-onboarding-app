import FeaturesGrid from '@/components/landing-page/features-grid';
import StatsSection from '@/components/landing-page/stats-section';
import HeroSection from '@/components/landing-page/hero-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <HeroSection />
          <FeaturesGrid />
        </div>
      </div>
      <StatsSection />
    </div>
  );
}
