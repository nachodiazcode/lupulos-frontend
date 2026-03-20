"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Hop flower SVG ─── */
function HopFlower() {
  return (
    <motion.svg
      viewBox="0 0 60 60"
      width="68"
      height="68"
      style={{ transformOrigin: "center" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <g key={deg} transform={`rotate(${deg}, 30, 30)`}>
          <ellipse
            cx="30"
            cy="17"
            rx="5"
            ry="11"
            fill="var(--color-amber-primary, #fbbf24)"
            fillOpacity={0.78}
          />
        </g>
      ))}
      <circle cx="30" cy="30" r="5.5" fill="var(--color-amber-primary, #fbbf24)" />
    </motion.svg>
  );
}

/* ─── Expanding ripple ring ─── */
function Ripple({ delay }: { delay: number }) {
  return (
    <motion.span
      className="absolute rounded-full"
      style={{
        inset: 0,
        border: "1px solid rgba(251,191,36,0.28)",
      }}
      animate={{ scale: [1, 2.5], opacity: [0.65, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

/* ─── Main loader ─── */
export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!done && (
          <motion.div
            key="app-loader"
            className="fixed inset-0 flex flex-col items-center justify-center gap-8"
            style={{
              /* Hardcoded ambar dark — resolves before CSS vars are ready */
              background:
                "linear-gradient(180deg, #0c0a09 0%, #1a1510 45%, #2a2018 70%, #0c0a09 100%)",
              zIndex: 99999,
            }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Spinner: hop flower + ripple rings */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: 112, height: 112 }}
            >
              <Ripple delay={0} />
              <Ripple delay={0.8} />
              <Ripple delay={1.6} />
              <HopFlower />
            </div>

            {/* Wordmark */}
            <div className="flex flex-col items-center gap-2">
              <motion.p
                className="text-[2rem] font-black tracking-[0.35em] uppercase"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                LÚPULOS
              </motion.p>
              <motion.span
                className="text-[9px] tracking-[0.3em] uppercase"
                style={{ color: "rgba(251,191,36,0.38)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                cargando…
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}
