import { createTheme } from "@mui/material/styles";

export const beerThemes = {
  ipa: createTheme({
    palette: {
      mode: "light",
      primary: { main: "#FDB813" },
      background: { default: "#fffbe6" },
      text: { primary: "#5c4200" },
    },
  }),
  stout: createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#4B3621" },
      background: { default: "#1e1a18" },
      text: { primary: "#fff" },
    },
  }),
  saintpatrick: createTheme({
    palette: {
      mode: "light",
      primary: { main: "#3a8c5c" },
      background: { default: "#e0f0e6" },
      text: { primary: "#0d2b1a" },
    },
  }),
  pale: createTheme({
    palette: {
      mode: "light",
      primary: { main: "#D2691E" },
      background: { default: "#fff8f0" },
      text: { primary: "#502e00" },
    },
  }),
  pilsner: createTheme({
    palette: {
      mode: "light",
      primary: { main: "#F6C90E" },
      background: { default: "#fffcf0" },
      text: { primary: "#4a3f00" },
    },
  }),
};
