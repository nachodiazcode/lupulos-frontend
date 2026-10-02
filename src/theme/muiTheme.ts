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
    primary: { main: "#168f5f", dark: "#0a4f36", light: "#63d69e" },
    secondary: { main: "#bf7f10", dark: "#8a4f07", light: "#d89214" },
    error: { main: "#e53935", dark: "#c62828" },
    background: { default: "#f0fbf4", paper: "#fefffb" },
    text: { primary: "#071b12", secondary: "rgba(7,27,18,0.78)", disabled: "rgba(7,27,18,0.26)" },
    divider: "rgba(10,79,54,0.14)",
    brand: {
      navbarGradient: "linear-gradient(to right, #fbfffd, #e4f5ea)",
      drawerBg: "#fefffb",
      elevatedBg: "#ffffff",
      inputBg: "rgba(253,255,250,0.76)",
      inputBorder: "rgba(10,79,54,0.15)",
      inputBorderHover: "rgba(22,143,95,0.34)",
      inputBorderFocus: "#168f5f",
      inputLabel: "rgba(7,27,18,0.48)",
      inputLabelFocus: "#168f5f",
      buttonGradient: "linear-gradient(135deg, #8bf0bd 0%, #22c983 26%, #168f5f 56%, #0f744d 78%, #d89214 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #63d69e, #168f5f, #d89214)",
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
    primary: { main: "#7c3aed", dark: "#4c1d95", light: "#b79cff" },
    secondary: { main: "#e64891", dark: "#c0266f", light: "#f08abd" },
    error: { main: "#ef4444", dark: "#dc2626" },
    background: { default: "#f7f2ff", paper: "#fffafe" },
    text: { primary: "#12061f", secondary: "rgba(18,6,31,0.72)", disabled: "rgba(18,6,31,0.26)" },
    divider: "rgba(124,58,237,0.10)",
    brand: {
      navbarGradient: "linear-gradient(to right, #fcf8ff, #ede3ff)",
      drawerBg: "#fffafe",
      elevatedBg: "#ffffff",
      inputBg: "rgba(255,251,255,0.76)",
      inputBorder: "rgba(124,58,237,0.16)",
      inputBorderHover: "rgba(124,58,237,0.32)",
      inputBorderFocus: "#7c3aed",
      inputLabel: "rgba(18,6,31,0.45)",
      inputLabelFocus: "#7c3aed",
      buttonGradient: "linear-gradient(135deg, #7c3aed 0%, #b453f4 28%, #e64891 60%, #0eb9cf 100%)",
      buttonHoverGradient: "linear-gradient(135deg, #6d28d9, #e64891, #0eb9cf)",
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
