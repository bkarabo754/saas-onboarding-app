'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function PlanCard({
  name,
  price,
  features,
  isPopular,
  isRecommended,
  isSelected,
  onSelect,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105',
        {
          'ring-2 ring-blue-500 shadow-xl scale-105': isSelected,
          'border-purple-200': isRecommended && !isSelected,
        }
      )}
      onClick={onSelect}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {name}
        </CardTitle>
        <div className="mt-2">
          <span className="text-4xl font-bold">R{price}</span>
          <span className="text-gray-500">/month</span>
        </div>
        <CardDescription className="mt-2">
          Perfect for {name.toLowerCase()} teams
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={cn(
            'w-full mt-6 transition-all duration-200 cursor-pointer',
            {
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white':
                isSelected,
              'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:text-white':
                isRecommended && !isSelected,
            }
          )}
          variant={isSelected ? 'default' : 'outline'}
        >
          {isSelected ? 'Selected' : 'Choose Plan'}
        </Button>

        {isRecommended && (
          <div className="flex justify-center">
            <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Recommended
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
