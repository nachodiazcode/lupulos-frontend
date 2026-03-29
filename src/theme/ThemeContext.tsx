"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ═══════════════════════════════════
   Types
   ═══════════════════════════════════ */

export type BeerTheme = "ambar" | "saintpatrick" | "stout" | "haze" | "dorado";

export const BEER_THEMES: { id: BeerTheme; label: string; icon: string }[] = [
  { id: "saintpatrick", label: "St. Patrick", icon: "🍀" },
  { id: "ambar", label: "Ámbar", icon: "🍻" },
  { id: "stout", label: "Stout", icon: "🖤" },
  { id: "haze", label: "Haze", icon: "🔮" },
  { id: "dorado", label: "Dorado", icon: "👑" },
];

const STORAGE_KEY = "lupulos-theme";
const DEFAULT_THEME: BeerTheme = "stout";

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
  if (stored === "saintpatrick" || stored === "ambar" || stored === "stout" || stored === "haze" || stored === "dorado") return stored;
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

  const isDark = theme !== "saintpatrick" && theme !== "haze";

  return (
    <BeerThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </BeerThemeContext.Provider>
  );
}
