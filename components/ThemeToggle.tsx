"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

/**
 * Switches the plate between daylight and dark.
 *
 * The icon names the destination rather than the current state — a moon means
 * "go dark" — and the accessible name says so in words, because an icon alone
 * cannot disambiguate which of the two it means.
 */
export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const goingDark = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={goingDark ? 'Switch to dark theme' : 'Switch to light theme'}
      title={goingDark ? 'Switch to dark theme' : 'Switch to light theme'}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-rule text-ink-muted transition-colors hover:border-ink hover:text-ink"
    >
      {goingDark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
};
