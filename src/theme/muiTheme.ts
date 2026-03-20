import { createTheme, type Theme } from "@mui/material/styles";
import type { BeerTheme } from "./ThemeContext";

/* ═══════════════════════════════════════════════════════════
   Lúpulos App — MUI Theme Factory
   ═══════════════════════════════════════════════════════════
   Generates a MUI theme for each beer theme. Colors are
   static (MUI needs real values for SSR) and must stay in
   sync with the CSS tokens in globals.scss.
   ═══════════════════════════════════════════════════════════ */

interface BrandTokens {
  navbarGradient: string;
  drawerBg: string;
  elevatedBg: string;
  inputBg: string;
  inputBorder: string;
  inputBorderHover: string;
  inputBorderFocus: string;
  inputLabel: string;
  inputLabelFocus: string;
  buttonGradient: string;
  buttonHoverGradient: string;
}

interface ThemePalette {
  mode: "light" | "dark";
  primary: { main: string; dark: string; light: string };
  secondary: { main: string; dark: string; light: string };
  error: { main: string; dark: string };
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
  brand: BrandTokens;
}

const palettes: Record<BeerTheme, ThemePalette> = {
  /* ─── Ámbar ─── */
  ambar: {
    mode: "dark",
    primary: { main: "#fbbf24", dark: "#d97706", light: "#facc15" },
    secondary: { main: "#34d399", dark: "#059669", light: "#6ee7b7" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#0c0a09", paper: "#1c1814" },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.6)",
      disabled: "rgba(255,255,255,0.25)",
    },
    divider: "rgba(255,255,255,0.1)",
    brand: {
      navbarGradient: "linear-gradient(to right, #3d2610, #5c3a1a)",
      drawerBg: "#181210",
      elevatedBg: "#221c16",
      inputBg: "#1c1814",
      inputBorder: "rgba(255,255,255,0.1)",
      inputBorderHover: "rgba(251,191,36,0.4)",
      inputBorderFocus: "#fbbf24",
      inputLabel: "rgba(255,255,255,0.4)",
      inputLabelFocus: "#fbbf24",
      buttonGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #facc15, #fbbf24)",
    },
  },

  /* ─── Lager (Gruvbox crossover) ─── */
  lager: {
    mode: "light",
    primary: { main: "#d79921", dark: "#af3a03", light: "#fabd2f" },
    secondary: { main: "#689d6a", dark: "#427b58", light: "#8ec07c" },
    error: { main: "#cc241d", dark: "#9d0006" },
    background: { default: "#d5c4a1", paper: "#e2d6c1" },
    text: { primary: "#3c3836", secondary: "rgba(60,56,54,0.78)", disabled: "rgba(60,56,54,0.35)" },
    divider: "rgba(60,56,54,0.15)",
    brand: {
      navbarGradient: "linear-gradient(to right, #d9ccb4, #d5c4a1)",
      drawerBg: "#e2d6c1",
      elevatedBg: "#ebdbb2",
      inputBg: "#ebdbb2",
      inputBorder: "rgba(60,56,54,0.15)",
      inputBorderHover: "rgba(215,153,33,0.40)",
      inputBorderFocus: "#d79921",
      inputLabel: "rgba(60,56,54,0.52)",
      inputLabelFocus: "#d79921",
      buttonGradient: "linear-gradient(135deg, #d3869b 0%, #458588 30%, #8ec07c 60%, #fabd2f 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #b16286, #458588)",
    },
  },

  /* ─── Stout ─── */
  stout: {
    mode: "dark",
    primary: { main: "#fbbf24", dark: "#d97706", light: "#facc15" },
    secondary: { main: "#34d399", dark: "#059669", light: "#6ee7b7" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#09090b", paper: "#1c1c20" },
    text: {
      primary: "#fafafa",
      secondary: "rgba(250,250,250,0.6)",
      disabled: "rgba(250,250,250,0.25)",
    },
    divider: "rgba(250,250,250,0.08)",
    brand: {
      navbarGradient: "linear-gradient(to right, #18181b, #27272a)",
      drawerBg: "#111113",
      elevatedBg: "#27272a",
      inputBg: "#1c1c20",
      inputBorder: "rgba(250,250,250,0.08)",
      inputBorderHover: "rgba(251,191,36,0.3)",
      inputBorderFocus: "#fbbf24",
      inputLabel: "rgba(250,250,250,0.4)",
      inputLabelFocus: "#fbbf24",
      buttonGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #facc15, #fbbf24)",
    },
  },
};

/* ─── Theme factory ─── */

function createBeerTheme(name: BeerTheme): Theme {
  const p = palettes[name];
  const b = p.brand;

  return createTheme({
    palette: {
      mode: p.mode,
      primary: {
        main: p.primary.main,
        dark: p.primary.dark,
        light: p.primary.light,
        contrastText: p.mode === "light" ? "#fff" : "#000",
      },
      secondary: {
        main: p.secondary.main,
        dark: p.secondary.dark,
        light: p.secondary.light,
        contrastText: "#000",
      },
      error: { main: p.error.main, dark: p.error.dark },
      background: { default: p.background.default, paper: p.background.paper },
      text: { primary: p.text.primary, secondary: p.text.secondary, disabled: p.text.disabled },
      divider: p.divider,
    },

    typography: { fontFamily: '"Ubuntu", Arial, Helvetica, sans-serif' },
    shape: { borderRadius: 12 },

    components: {
      /* ─── TextField ─── */
      MuiTextField: {
        defaultProps: { variant: "outlined", fullWidth: true },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: b.inputBg,
              borderRadius: 12,
              color: p.text.primary,
              "& fieldset": { borderColor: b.inputBorder },
              "&:hover fieldset": { borderColor: b.inputBorderHover },
              "&.Mui-focused fieldset": { borderColor: b.inputBorderFocus },
            },
            "& .MuiInputLabel-root": {
              color: b.inputLabel,
              "&.Mui-focused": { color: b.inputLabelFocus },
            },
          },
        },
      },

      /* ─── Button ─── */
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            background: b.buttonGradient,
            color: p.mode === "light" ? "#fff" : "#000",
            fontWeight: 700,
            textTransform: "none" as const,
            "&:hover": { background: b.buttonHoverGradient },
          },
          outlinedPrimary: {
            borderColor: p.primary.main,
            color: p.primary.main,
            textTransform: "none" as const,
            "&:hover": {
              backgroundColor: p.mode === "dark" ? "rgba(251,191,36,0.08)" : "rgba(202,138,4,0.08)",
              borderColor: p.primary.light,
            },
          },
        },
      },

      /* ─── Dialog / Modal ─── */
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundColor: b.elevatedBg, color: p.text.primary, borderRadius: 16 },
        },
      },

      /* ─── AppBar ─── */
      MuiAppBar: {
        styleOverrides: { root: { background: b.navbarGradient } },
      },

      /* ─── Drawer ─── */
      MuiDrawer: {
        styleOverrides: { paper: { backgroundColor: b.drawerBg, color: p.text.primary } },
      },

      /* ─── Snackbar Alert ─── */
      MuiAlert: {
        styleOverrides: {
          filledSuccess: { backgroundColor: "#059669", borderRadius: 10, fontWeight: 600 },
          filledError: { backgroundColor: "#dc2626", borderRadius: 10, fontWeight: 600 },
        },
      },

      /* ─── Chip ─── */
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700 } },
      },
    },
  });
}

/* Pre-built themes (avoids re-creating on every render) */
export const beerMuiThemes: Record<BeerTheme, Theme> = {
  ambar: createBeerTheme("ambar"),
  lager: createBeerTheme("lager"),
  stout: createBeerTheme("stout"),
};

/* Backwards-compatible default export */
export default beerMuiThemes.ambar;
