"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ═══════════════════════════════════
   Types
   ═══════════════════════════════════ */

export type BeerTheme = "ambar" | "lager" | "stout";

export const BEER_THEMES: { id: BeerTheme; label: string; icon: string }[] = [
  { id: "lager", label: "Lager", icon: "🍺" },
  { id: "ambar", label: "Ámbar", icon: "🍻" },
  { id: "stout", label: "Stout", icon: "🖤" },
];

const STORAGE_KEY = "lupulos-theme";
const DEFAULT_THEME: BeerTheme = "ambar";

/* ═══════════════════════════════════
   Context
   ═══════════════════════════════════ */

interface BeerThemeContextValue {
  theme: BeerTheme;
  setTheme: (t: BeerTheme) => void;
  isDark: boolean;
}

const BeerThemeContext = createContext<BeerThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  isDark: true,
});

export const useBeerTheme = () => useContext(BeerThemeContext);

/* ═══════════════════════════════════
   Provider
   ═══════════════════════════════════ */

function getInitialTheme(): BeerTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "lager" || stored === "ambar" || stored === "stout") return stored;
  return DEFAULT_THEME;
}

export function BeerThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BeerTheme>(DEFAULT_THEME);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const setTheme = useCallback((t: BeerTheme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const isDark = theme !== "lager";

  return (
    <BeerThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </BeerThemeContext.Provider>
  );
}
