"use client";

import { ThemeProvider } from "@mui/material/styles";
import { BeerThemeProvider, useBeerTheme } from "./ThemeContext";
import { beerMuiThemes } from "./muiTheme";

/**
 * Client-side wrapper that provides:
 *  1. BeerThemeProvider  — React context + data-theme on <html>
 *  2. MUI ThemeProvider   — MUI theme matching the active beer theme
 *
 * NOTE: No CssBaseline — Tailwind's preflight already handles CSS resets.
 */

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { theme } = useBeerTheme();
  return <ThemeProvider theme={beerMuiThemes[theme]}>{children}</ThemeProvider>;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <BeerThemeProvider>
      <MuiThemeBridge>{children}</MuiThemeBridge>
    </BeerThemeProvider>
  );
}
