'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onChangeAction: (selected: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ChipSelector({
  options,
  selected,
  onChangeAction,
  multiple = true,
  className,
}: ChipSelectorProps) {
  const handleToggle = (option: string) => {
    if (multiple) {
      if (selected.includes(option)) {
        onChangeAction(selected.filter((item) => item !== option));
      } else {
        onChangeAction([...selected, option]);
      }
    } else {
      onChangeAction(selected.includes(option) ? [] : [option]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => handleToggle(option)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-95',
              {
                'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg':
                  isSelected,
                'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50':
                  !isSelected,
              }
            )}
          >
            {isSelected && <Check className="w-4 h-4" />}
            <span className="text-sm font-medium">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
