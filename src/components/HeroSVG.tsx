"use client";

import { Box } from "@mui/material";

export default function HeroSVG() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Inserta aquí tu archivo SVG directamente o como <img /> si lo tienes en /public */}
      <img
        src="/images/lupin-lupina-hero.svg" // Asegúrate que esté en la carpeta public/images/
        alt="Lupín y Lupina brindando"
        style={{ width: "100%", height: "auto" }}
      />
    </Box>
  );
}
