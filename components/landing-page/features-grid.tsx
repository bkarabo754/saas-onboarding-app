'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sparkles, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Recommendations',
    description:
      'Get personalized suggestions based on your goals, industry, and team size',
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Target,
    title: 'Smart Setup Flow',
    description:
      'Intelligent multi-step onboarding that adapts to your specific needs',
    color:
      'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Zap,
    title: 'Ready in Minutes',
    description: 'From signup to fully configured workspace in under 5 minutes',
    color: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400',
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="text-center pb-4">
              <div
                className={`mx-auto p-3 ${feature.color.split(' ').slice(0, 2).join(' ')} rounded-full w-fit mb-4`}
              >
                <IconComponent
                  className={`h-6 w-6 ${feature.color.split(' ').slice(2).join(' ')}`}
                />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
