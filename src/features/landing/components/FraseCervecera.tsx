"use client";

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const quotes = [
  "🍺 «El arte de la cerveza es unir lo amargo con lo inolvidable.»",
  "👑 «Donde hay cerveza, hay historias que valen oro.»",
  "🔥 «El lúpulo no se explica, se siente.»",
  "🛡️ «Una buena cerveza no se bebe… se honra.»",
  "🍻 «Brindemos por las cervezas que nos unen y los bares que nos salvan.»",
];
export default function BeerQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(nextQuote);
  }, []);

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        background: "linear-gradient(90deg, var(--color-amber-muted), var(--color-amber-light))",
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
          color: "var(--color-text-primary)",
          textShadow: "1px 1px 2px color-mix(in srgb, var(--color-surface-elevated) 60%, transparent)",
        }}
      >
        {quote}
      </Typography>
    </Box>
  );
}
