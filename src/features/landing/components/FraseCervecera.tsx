"use client";

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const quotes = [
  "🍺 «El lúpulo no pide permiso. Llega, conquista y te cambia el paladar para siempre.»",
  "👑 «La cerveza artesanal no se toma — se vive, se debate y se defiende con el vaso en alto.»",
  "🔥 «Detrás de cada cerveza craft hay alguien que apostó todo por un sabor que nadie había probado.»",
  "🛡️ «Una cerveza honesta vale más que cien etiquetas bonitas. Y la comunidad siempre lo sabe.»",
  "🍻 «Por los que piden la carta de cervezas antes que la de comida. Este lugar es para ustedes.»",
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
