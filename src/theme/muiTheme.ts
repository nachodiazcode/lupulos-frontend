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

  /* ─── Lager ─── */
  lager: {
    mode: "light",
    primary: { main: "#ca8a04", dark: "#854d0e", light: "#eab308" },
    secondary: { main: "#059669", dark: "#047857", light: "#34d399" },
    error: { main: "#dc2626", dark: "#b91c1c" },
    background: { default: "#fffbf5", paper: "#ffffff" },
    text: { primary: "#292018", secondary: "rgba(41,32,24,0.7)", disabled: "rgba(41,32,24,0.3)" },
    divider: "rgba(41,32,24,0.1)",
    brand: {
      navbarGradient: "linear-gradient(to right, #fff7e8, #fff0d4)",
      drawerBg: "#fff7e8",
      elevatedBg: "#ffffff",
      inputBg: "#ffffff",
      inputBorder: "rgba(41,32,24,0.15)",
      inputBorderHover: "rgba(202,138,4,0.4)",
      inputBorderFocus: "#ca8a04",
      inputLabel: "rgba(41,32,24,0.5)",
      inputLabelFocus: "#ca8a04",
      buttonGradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #facc15, #eab308)",
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
