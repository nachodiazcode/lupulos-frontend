"use client";

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const frases = [
  "🍺 «El arte de la cerveza es unir lo amargo con lo inolvidable.»",
  "👑 «Donde hay cerveza, hay historias que valen oro.»",
  "🔥 «El lúpulo no se explica, se siente.»",
  "🛡️ «Una buena cerveza no se bebe… se honra.»",
  "🍻 «Brindemos por las cervezas que nos unen y los bares que nos salvan.»",
];

export default function FraseCervecera() {
  const [frase, setFrase] = useState(frases[0]);

  useEffect(() => {
    const nueva = frases[Math.floor(Math.random() * frases.length)];
    setFrase(nueva);
  }, []);

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        background: "linear-gradient(90deg, #fef9c3, #fcd34d)",
        textAlign: "center",
        mt: 8,
        animation: "fadeIn 2s ease-in-out",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          fontSize: { xs: "1.4rem", md: "1.8rem" },
          color: "#4A2502",
          textShadow: "1px 1px 2px #fff",
        }}
      >
        {frase}
      </Typography>
    </Box>
  );
}
