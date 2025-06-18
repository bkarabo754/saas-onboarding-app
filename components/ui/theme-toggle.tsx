'use client';

import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const handleToggle = (pressed: boolean) => {
    setIsDark(pressed);
    setTheme(pressed ? 'dark' : 'light');
  };

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={handleToggle}
      aria-label="Toggle theme"
      className={cn(
        'border-none ring-0 focus:outline-none focus:ring-0 bg-transparent hover:bg-muted',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Toggle>
  );
}
