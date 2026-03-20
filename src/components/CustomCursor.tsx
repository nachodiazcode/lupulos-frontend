"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom amber cursor — desktop only (pointer: fine).
 * - Inner dot: snappy, instant follow
 * - Outer ring: laggy, spring-based follow
 * - Expands on interactive elements
 * - Hides native cursor via CSS class on <html>
 */
export default function CustomCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [visible, setVisible] = useState(false);
  const [pointer, setPointer] = useState(false);

  /* Inner dot — instant */
  const dx = useSpring(mx, { stiffness: 2000, damping: 80 });
  const dy = useSpring(my, { stiffness: 2000, damping: 80 });

  /* Outer ring — laggy */
  const rx = useSpring(mx, { stiffness: 160, damping: 20 });
  const ry = useSpring(my, { stiffness: 160, damping: 20 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setPointer(window.getComputedStyle(el).cursor === "pointer");
    };

    document.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onOver);
    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Outer ring — lags behind the pointer */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          x: rx,
          y: ry,
          translateX: "-50%",
          translateY: "-50%",
          border: "1.5px solid rgba(251,191,36,0.55)",
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s",
        }}
        animate={{
          width: pointer ? 48 : 34,
          height: pointer ? 48 : 34,
        }}
        transition={{ duration: 0.22 }}
      />

      {/* Inner dot — instant follow */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          x: dx,
          y: dy,
          translateX: "-50%",
          translateY: "-50%",
          width: 7,
          height: 7,
          background: "var(--color-amber-primary)",
          boxShadow: "0 0 10px 3px rgba(251,191,36,0.55)",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s",
        }}
        animate={{ scale: pointer ? 0.45 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
