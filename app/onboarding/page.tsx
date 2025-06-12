'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { ChipSelector } from '@/components/onboarding/ChipSelector';
import { PlanCard } from '@/components/onboarding/PlanCard';

const STEPS = [
  { title: 'About You', description: 'Tell us about yourself' },
  { title: 'Your Goals', description: 'What you want to achieve' },
  { title: 'Preferences', description: 'Customize your experience' },
  { title: 'AI Recommendations', description: 'Personalized suggestions' },
  { title: 'Choose Plan', description: 'Select your subscription' },
];

const ROLES = [
  'CEO/Founder',
  'CTO/Technical Lead',
  'Product Manager',
  'Marketing Manager',
  'Sales Manager',
  'Operations Manager',
  'Developer',
  'Designer',
  'Consultant',
  'Other',
];

const COMPANY_SIZES = [
  'Just me',
  '2-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees',
];

const GOALS = [
  'Increase productivity',
  'Improve team collaboration',
  'Better analytics & reporting',
  'Automate workflows',
  'Scale operations',
  'Reduce costs',
  'Improve customer experience',
  'Data-driven decisions',
  'Streamline processes',
  'Enhance security',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Non-profit',
  'Other',
];

const CHALLENGES = [
  'Manual processes',
  'Poor communication',
  'Lack of visibility',
  'Data silos',
  'Scalability issues',
  'Security concerns',
  'Integration complexity',
  'User adoption',
  'Cost management',
  'Compliance requirements',
];

const FEATURES = [
  'Advanced Analytics',
  'Team Collaboration',
  'API Access',
  'Custom Integrations',
  'Mobile App',
  'Automated Workflows',
  'Real-time Notifications',
  'Data Export',
  'Custom Dashboards',
  'Third-party Integrations',
];

const INTEGRATIONS = [
  'Slack',
  'Microsoft Teams',
  'Google Workspace',
  'Office 365',
  'Salesforce',
  'HubSpot',
  'Zapier',
  'Trello',
  'Asana',
  'Jira',
  'GitHub',
  'Stripe',
];

interface OnboardingData {
  role: string;
  company: string;
  companySize: string;
  primaryGoals: string[];
  industryType: string;
  currentChallenges: string[];
  preferredFeatures: string[];
  integrations: string[];
  teamSize: string;
  budget: string;
  aiRecommendations?: any;
  selectedPlan?: string;
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    company: '',
    companySize: '',
    primaryGoals: [],
    industryType: '',
    currentChallenges: [],
    preferredFeatures: [],
    integrations: [],
    teamSize: '',
    budget: '',
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      // Generate AI recommendations
      setAiLoading(true);
      try {
        const response = await fetch('/api/onboarding/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const recommendations = await response.json();
          updateData({ aiRecommendations: recommendations });
          toast.success('AI recommendations generated!');
        }
      } catch (error) {
        toast.error('Failed to generate recommendations');
      }
      setAiLoading(false);
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Onboarding completed!');
        router.push('/dashboard');
      } else {
        toast.error('Failed to complete onboarding');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.role && data.company && data.companySize;
      case 2:
        return data.primaryGoals.length > 0 && data.industryType;
      case 3:
        return data.preferredFeatures.length > 0;
      case 4:
        return true;
      case 5:
        return data.selectedPlan;
      default:
        return false;
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress
            value={(currentStep / STEPS.length) * 100}
            className="h-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <span>
              {Math.round((currentStep / STEPS.length) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={currentStep - 1}
        />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardContent className="p-8">
                {/* Step 1: About You */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Tell us about yourself
                      </h2>
                      <p className="text-gray-600">
                        Help us personalize your experience
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            value={data.company}
                            onChange={(e) =>
                              updateData({ company: e.target.value })
                            }
                            placeholder="Enter your company name"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>What's your role?</Label>
                          <div className="mt-2">
                            <ChipSelector
                              options={ROLES}
                              selected={data.role ? [data.role] : []}
                              onChangeAction={(selected) =>
                                updateData({ role: selected[0] || '' })
                              }
                              multiple={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Company size</Label>
                        <div className="mt-2">
                          <ChipSelector
                            options={COMPANY_SIZES}
                            selected={
                              data.companySize ? [data.companySize] : []
                            }
                            onChangeAction={(selected) =>
                              updateData({ companySize: selected[0] || '' })
                            }
                            multiple={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Goals */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        What are your main goals?
                      </h2>
                      <p className="text-gray-600">
                        Select all that apply to help us understand your needs
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold">
                          Primary Goals
                        </Label>
                        <div className="mt-3">
                          <ChipSelector
                            options={GOALS}
                            selected={data.primaryGoals}
                            onChangeAction={(selected) =>
                              updateData({ primaryGoals: selected })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold">
                          Industry
                        </Label>
                        <div className="mt-3">
                          <ChipSelector
                            options={INDUSTRIES}
                            selected={
                              data.industryType ? [data.industryType] : []
                            }
                            onChangeAction={(selected) =>
                              updateData({ industryType: selected[0] || '' })
                            }
                            multiple={false}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold">
                          Current Challenges (Optional)
                        </Label>
                        <div className="mt-3">
                          <ChipSelector
                            options={CHALLENGES}
                            selected={data.currentChallenges}
                            onChangeAction={(selected) =>
                              updateData({ currentChallenges: selected })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Preferences */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Customize your experience
                      </h2>
                      <p className="text-gray-600">
                        Tell us about your preferences and requirements
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold">
                          Features you're most interested in
                        </Label>
                        <div className="mt-3">
                          <ChipSelector
                            options={FEATURES}
                            selected={data.preferredFeatures}
                            onChangeAction={(selected) =>
                              updateData({ preferredFeatures: selected })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold">
                          Integrations you need (Optional)
                        </Label>
                        <div className="mt-3">
                          <ChipSelector
                            options={INTEGRATIONS}
                            selected={data.integrations}
                            onChangeAction={(selected) =>
                              updateData({ integrations: selected })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="teamSize">Expected team size</Label>
                          <Input
                            id="teamSize"
                            value={data.teamSize}
                            onChange={(e) =>
                              updateData({ teamSize: e.target.value })
                            }
                            placeholder="e.g., 5-10 people"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="budget">Monthly budget range</Label>
                          <Input
                            id="budget"
                            value={data.budget}
                            onChange={(e) =>
                              updateData({ budget: e.target.value })
                            }
                            placeholder="e.g., R50-100/month"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: AI Recommendations */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        AI-Powered Recommendations
                      </h2>
                      <p className="text-gray-600">
                        Based on your responses, here are our personalized
                        suggestions
                      </p>
                    </div>

                    {aiLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                        <p className="text-lg text-gray-600">
                          Generating your personalized recommendations...
                        </p>
                      </div>
                    ) : data.aiRecommendations ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                              <Sparkles className="h-5 w-5" />
                              Recommended Features
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {data.aiRecommendations.topFeatures?.map(
                                (feature: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    {feature}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-blue-700">
                              Suggested Integrations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {data.aiRecommendations.suggestedIntegrations?.map(
                                (integration: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    {integration}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="md:col-span-2 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-green-700">
                              Your Next Steps
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {data.aiRecommendations.nextSteps?.map(
                                (step: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {step}
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button
                          onClick={handleNext}
                          disabled={aiLoading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer"
                        >
                          Generate AI Recommendations
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Choose Plan */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Choose your plan
                      </h2>
                      <p className="text-gray-600">
                        Select the plan that best fits your needs
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <PlanCard
                        name="Starter"
                        price={29}
                        features={[
                          'Up to 5 team members',
                          'Basic analytics',
                          'Email support',
                          '10GB storage',
                        ]}
                        isSelected={data.selectedPlan === 'starter'}
                        onSelect={() => updateData({ selectedPlan: 'starter' })}
                      />

                      <PlanCard
                        name="Professional"
                        price={79}
                        features={[
                          'Up to 25 team members',
                          'Advanced analytics',
                          'Priority support',
                          '100GB storage',
                          'API access',
                          'Custom integrations',
                        ]}
                        isPopular
                        isRecommended={
                          data.aiRecommendations?.recommendedPlan ===
                          'Professional'
                        }
                        isSelected={data.selectedPlan === 'professional'}
                        onSelect={() =>
                          updateData({ selectedPlan: 'professional' })
                        }
                      />

                      <PlanCard
                        name="Enterprise"
                        price={199}
                        features={[
                          'Unlimited team members',
                          'Enterprise analytics',
                          '24/7 phone support',
                          'Unlimited storage',
                          'Full API access',
                          'Custom integrations',
                          'Dedicated account manager',
                        ]}
                        isSelected={data.selectedPlan === 'enterprise'}
                        onSelect={() =>
                          updateData({ selectedPlan: 'enterprise' })
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-4xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length ? (
              <Button
                onClick={handleFinish}
                disabled={!canProceed() || isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2  cursor-pointer"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  !canProceed() ||
                  (currentStep === 4 && !data.aiRecommendations)
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
              >
                {currentStep === 4 && !data.aiRecommendations
                  ? 'Generate Recommendations'
                  : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
