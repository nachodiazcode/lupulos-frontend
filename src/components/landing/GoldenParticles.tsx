"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Floating golden hop-leaf particles that drift across the background.
 * Pure CSS + framer-motion, no external deps.
 */

interface Particle {
  id: number;
  x: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number; // horizontal sway px
  symbol: string;
}

const SYMBOLS = ["✦", "❋", "✧", "⚘", "•"];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${(Math.random() * 100).toFixed(1)}%`,
    size: 6 + Math.random() * 14,
    duration: 14 + Math.random() * 20,
    delay: Math.random() * 18,
    opacity: 0.06 + Math.random() * 0.18,
    drift: -30 + Math.random() * 60,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  }));
}

export default function GoldenParticles({ count = 30 }: { count?: number }) {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none"
          style={{
            left: p.x,
            bottom: "-20px",
            fontSize: p.size,
            color: "var(--color-amber-primary)",
            opacity: 0,
            textShadow: "0 0 8px var(--color-amber-primary)",
          }}
          animate={{
            y: [0, -(typeof window !== "undefined" ? window.innerHeight + 60 : 1100)],
            x: [0, p.drift, 0],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}
