"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Box } from "@mui/material";

/* ─── Color palette for each bubble type ─── */
const BUBBLE_COLORS = [
  "var(--color-amber-muted)",
  "var(--color-amber-light)",
  "var(--color-amber-primary)",
  "var(--color-amber-dark)",
];

export default function GoldenBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /* Ambient floating bubbles — more opaque, with glow */
  const ambientBubbles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: `amb-${i}`,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 8 + Math.random() * 20,
      opacity: 0.25 + Math.random() * 0.35,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 6,
      color: BUBBLE_COLORS[Math.floor(Math.random() * 4)],
      glow: Math.random() > 0.5,
    }));
  }, []);

  /* Rising bubbles — start at bottom, drift up like real beer */
  const risingBubbles = useMemo(() => {
    return [...Array(14)].map((_, i) => ({
      id: `rise-${i}`,
      left: 5 + Math.random() * 90,
      size: 4 + Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.35,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 10,
      drift: -20 + Math.random() * 40, // horizontal drift px
      color: BUBBLE_COLORS[Math.floor(Math.random() * 4)],
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
      {/* Ambient floating — blurred for depth */}
      {ambientBubbles.map((b) => (
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
            filter: b.glow ? `blur(${b.size * 0.3}px)` : `blur(${b.size * 0.15}px)`,
            boxShadow: b.glow
              ? `0 0 ${b.size}px ${b.color}, inset 0 0 ${b.size * 0.5}px rgba(255,255,255,0.2)`
              : `inset 0 0 ${b.size * 0.4}px rgba(255,255,255,0.1)`,
            animation: `ambientFloat ${b.duration}s ease-in-out ${b.delay}s infinite`,
            "@keyframes ambientFloat": {
              "0%": { transform: "translateY(0px) scale(1)", opacity: b.opacity },
              "50%": {
                transform: "translateY(-25px) scale(1.15)",
                opacity: Math.min(b.opacity + 0.15, 0.75),
              },
              "100%": { transform: "translateY(0px) scale(1)", opacity: b.opacity },
            },
          }}
        />
      ))}

      {/* Rising bubbles — real beer effect with soft blur */}
      {risingBubbles.map((b) => (
        <Box
          key={b.id}
          sx={{
            position: "absolute",
            bottom: "-5%",
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: "50%",
            backgroundColor: b.color,
            filter: `blur(${b.size * 0.2}px)`,
            boxShadow: `0 0 ${b.size * 0.6}px ${b.color}, inset 0 0 ${b.size * 0.5}px rgba(255,255,255,0.25)`,
            animation: `riseUp${b.id.replace("-", "")} ${b.duration}s ease-in ${b.delay}s infinite`,
            [`@keyframes riseUp${b.id.replace("-", "")}`]: {
              "0%": {
                transform: `translateY(0px) translateX(0px) scale(0.6)`,
                opacity: 0,
              },
              "10%": {
                opacity: b.opacity,
              },
              "50%": {
                transform: `translateY(-50vh) translateX(${b.drift * 0.6}px) scale(0.9)`,
                opacity: b.opacity,
              },
              "90%": {
                opacity: b.opacity * 0.4,
              },
              "100%": {
                transform: `translateY(-105vh) translateX(${b.drift}px) scale(1)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}

      {/* Foam shimmer — subtle top glow */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background:
            "linear-gradient(180deg, rgba(251,191,36,0.04) 0%, transparent 100%)",
          animation: "foamBreath 6s ease-in-out infinite",
          "@keyframes foamBreath": {
            "0%": { opacity: 0.4 },
            "50%": { opacity: 0.8 },
            "100%": { opacity: 0.4 },
          },
        }}
      />
    </Box>
  );
}
