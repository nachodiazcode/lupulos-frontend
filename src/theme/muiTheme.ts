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

  /* ─── Saint Patrick (Shamrock Green + Celtic Gold Liquid Glass) ─── */
  saintpatrick: {
    mode: "light",
    primary: { main: "#3a8c5c", dark: "#1e5c34", light: "#52b788" },
    secondary: { main: "#f0a500", dark: "#d97706", light: "#fbbf24" },
    error: { main: "#e53935", dark: "#c62828" },
    background: { default: "#e0f0e6", paper: "#f2f9f5" },
    text: { primary: "#0d2b1a", secondary: "rgba(13,43,26,0.76)", disabled: "rgba(13,43,26,0.26)" },
    divider: "rgba(30,90,55,0.14)",
    brand: {
      navbarGradient: "linear-gradient(to right, #eaf5ef, #d8eadf)",
      drawerBg: "#f2f9f5",
      elevatedBg: "#f5fbf7",
      inputBg: "rgba(242,249,245,0.82)",
      inputBorder: "rgba(30,90,55,0.18)",
      inputBorderHover: "rgba(58,140,92,0.36)",
      inputBorderFocus: "#3a8c5c",
      inputLabel: "rgba(13,43,26,0.48)",
      inputLabelFocus: "#3a8c5c",
      buttonGradient: "linear-gradient(135deg, #52b788 0%, #3a8c5c 45%, #2d7549 75%, #1e5c34 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #52b788, #3a8c5c)",
    },
  },

  /* ─── Stout (dark purple) ─── */
  stout: {
    mode: "dark",
    primary: { main: "#fbbf24", dark: "#d97706", light: "#facc15" },
    secondary: { main: "#34d399", dark: "#059669", light: "#6ee7b7" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#0c0a14", paper: "#17132a" },
    text: {
      primary: "#f0eeff",
      secondary: "rgba(230,220,255,0.6)",
      disabled: "rgba(200,190,240,0.25)",
    },
    divider: "rgba(180,140,255,0.08)",
    brand: {
      navbarGradient: "linear-gradient(to right, #130f22, #1e1836)",
      drawerBg: "#0f0c1c",
      elevatedBg: "#1e1a34",
      inputBg: "#17132a",
      inputBorder: "rgba(180,140,255,0.10)",
      inputBorderHover: "rgba(251,191,36,0.3)",
      inputBorderFocus: "#fbbf24",
      inputLabel: "rgba(210,190,255,0.4)",
      inputLabelFocus: "#fbbf24",
      buttonGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #facc15, #fbbf24)",
    },
  },

  /* ─── Dorado (Epic Gold + Mint on Deep Obsidian) ─── */
  dorado: {
    mode: "dark",
    primary: { main: "#ffd700", dark: "#c9a800", light: "#ffe44d" },
    secondary: { main: "#5eead4", dark: "#14b8a6", light: "#99f6e4" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#030201", paper: "#0c0a06" },
    text: {
      primary: "#fff8e1",
      secondary: "rgba(255,248,225,0.65)",
      disabled: "rgba(255,240,200,0.25)",
    },
    divider: "rgba(255,215,0,0.08)",
    brand: {
      navbarGradient: "linear-gradient(to right, #0c0a04, #181408)",
      drawerBg: "#060504",
      elevatedBg: "#141208",
      inputBg: "#0c0a06",
      inputBorder: "rgba(255,215,0,0.08)",
      inputBorderHover: "rgba(255,215,0,0.28)",
      inputBorderFocus: "#ffd700",
      inputLabel: "rgba(255,240,200,0.42)",
      inputLabelFocus: "#ffd700",
      buttonGradient: "linear-gradient(135deg, #ffe44d 0%, #ffd700 30%, #e6b800 60%, #c9a800 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #ffe44d, #ffd700)",
    },
  },

  /* ─── Haze (Purple Pastel + Holographic Aurora 3D) ─── */
  haze: {
    mode: "light",
    primary: { main: "#8b5cf6", dark: "#6d28d9", light: "#a78bfa" },
    secondary: { main: "#ec4899", dark: "#db2777", light: "#f472b6" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#ede5ff", paper: "#faf7ff" },
    text: { primary: "#1a1028", secondary: "rgba(26,16,40,0.70)", disabled: "rgba(26,16,40,0.26)" },
    divider: "rgba(139,92,246,0.10)",
    brand: {
      navbarGradient: "linear-gradient(to right, #f3efff, #e8dff8)",
      drawerBg: "#faf7ff",
      elevatedBg: "#fcfaff",
      inputBg: "rgba(250,247,255,0.75)",
      inputBorder: "rgba(139,92,246,0.15)",
      inputBorderHover: "rgba(139,92,246,0.30)",
      inputBorderFocus: "#8b5cf6",
      inputLabel: "rgba(26,16,40,0.45)",
      inputLabelFocus: "#8b5cf6",
      buttonGradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #ec4899 55%, #06b6d4 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)",
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
  saintpatrick: createBeerTheme("saintpatrick"),
  stout: createBeerTheme("stout"),
  haze: createBeerTheme("haze"),
  dorado: createBeerTheme("dorado"),
};

/* Backwards-compatible default export */
export default beerMuiThemes.ambar;
