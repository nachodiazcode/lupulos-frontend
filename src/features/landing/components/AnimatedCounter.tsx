"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Animates a number counting up from 0 when it scrolls into view.
 * Handles suffixes like "K+", "+", etc.
 */

function parseValue(raw: string): { number: number; prefix: string; suffix: string } {
  const match = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!match) return { number: 0, prefix: "", suffix: raw };

  const numStr = match[2].replace(/,/g, "");
  const num = parseFloat(numStr);

  return {
    prefix: match[1],
    number: isNaN(num) ? 0 : num,
    suffix: match[3],
  };
}

function formatNumber(n: number, hasDecimal: boolean): string {
  if (hasDecimal) {
    return n.toFixed(1).replace(/\.0$/, "");
  }
  return Math.round(n).toLocaleString("es-CL");
}

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  const parsed = parseValue(value);
  const hasDecimal = value.includes(".");

  useEffect(() => {
    if (!isInView) return;

    let start: number | null = null;
    const target = parsed.number;
    const ms = duration * 1000;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / ms, 1);

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * target;

      setDisplay(formatNumber(current, hasDecimal));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(formatNumber(target, hasDecimal));
      }
    }

    requestAnimationFrame(step);
  }, [isInView, parsed.number, duration, hasDecimal]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {parsed.prefix}
      {display}
      {parsed.suffix}
    </motion.span>
  );
}
