"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/useTheme";
import { useSound } from "@/lib/sound";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
];

/**
 * Sits where the reference puts its EN / FR switch: two options side by side,
 * the current one in ink and the other one muted, so the state reads at a
 * glance without opening anything.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { play } = useSound();

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => {
        const current = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (current) return;
              setTheme(value);
              play("click");
            }}
            aria-pressed={current}
            aria-label={label}
            title={label}
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors duration-[120ms] ${
              current ? "text-n900" : "text-n500 hover:text-n900"
            }`}
          >
            <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
