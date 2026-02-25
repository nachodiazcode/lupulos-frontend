"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Box } from "@mui/material";

export default function GoldenBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const burbujas = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 10 + Math.random() * 25,
      opacity: 0.15 + Math.random() * 0.4,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 5,
      color: [
        "var(--color-amber-muted)",
        "var(--color-amber-light)",
        "var(--color-amber-primary)",
        "var(--color-amber-dark)",
      ][Math.floor(Math.random() * 4)],
    }));
  }, []);

  if (!isClient) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      {burbujas.map((b) => (
        <Box
          key={b.id}
          sx={{
            position: "absolute",
            top: `${b.top}%`,
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: "50%",
            backgroundColor: b.color,
            opacity: b.opacity,
            animation: `floatUp ${b.duration}s ease-in-out ${b.delay}s infinite`,
            "@keyframes floatUp": {
              "0%": { transform: "translateY(0px)", opacity: b.opacity },
              "50%": { transform: "translateY(-30px)", opacity: b.opacity + 0.1 },
              "100%": { transform: "translateY(0px)", opacity: b.opacity },
            },
          }}
        />
      ))}
    </Box>
  );
}
