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
  lager: createTheme({
    palette: {
      mode: "light",
      primary: { main: "#FFE066" },
      background: { default: "#fffdeb" },
      text: { primary: "#403d00" },
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
