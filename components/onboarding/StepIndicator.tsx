'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: { title: string; description: string }[];
  currentStep: number;
  completedSteps: number;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber <= completedSteps;
          const isAccessible = stepNumber <= currentStep;

          return (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                    {
                      'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white':
                        isActive,
                      'bg-green-500 border-green-500 text-white':
                        isCompleted && !isActive,
                      'border-gray-300 text-gray-400':
                        !isAccessible && !isCompleted,
                      'border-blue-200 text-blue-600 hover:border-blue-300':
                        isAccessible && !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label - Hidden on mobile, shown on larger screens */}
                <div className="mt-2 text-center hidden sm:block">
                  <div
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      {
                        'text-blue-600': isActive,
                        'text-green-600': isCompleted && !isActive,
                        'text-gray-400': !isAccessible && !isCompleted,
                        'text-gray-600':
                          isAccessible && !isActive && !isCompleted,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn('h-0.5 transition-colors duration-300', {
                      'bg-green-500': stepNumber < currentStep,
                      'bg-blue-300': stepNumber === currentStep,
                      'bg-gray-200': stepNumber > currentStep,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Title */}
      <div className="sm:hidden mt-4 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {steps[currentStep - 1]?.title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
