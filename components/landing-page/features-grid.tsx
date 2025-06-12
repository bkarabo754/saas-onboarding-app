import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Sparkles, Target, Zap } from 'lucide-react';

const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            Get personalized suggestions based on your goals, industry, and team
            size
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit mb-4">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Smart Setup Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            Intelligent multi-step onboarding that adapts to your specific needs
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit mb-4">
            <Zap className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle className="text-xl">Ready in Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            From signup to fully configured workspace in under 5 minutes
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesGrid;
