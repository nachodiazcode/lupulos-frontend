"use client";

import { useBeerTheme, BEER_THEMES } from "@/theme/ThemeContext";

/**
 * Compact theme switcher — 3 beer-inspired buttons.
 * Each button shows the beer emoji + name. Active theme gets a ring.
 */
export default function ThemeSwitcher() {
  const { theme, setTheme } = useBeerTheme();

  return (
    <div className="flex items-center gap-1">
      {BEER_THEMES.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={`Tema ${t.label}`}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-primary/15 text-amber-primary ring-amber-primary/40 ring-1"
                : "text-text-muted hover:bg-border-subtle hover:text-text-secondary"
            }`}
          >
            <span className="text-sm leading-none">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
