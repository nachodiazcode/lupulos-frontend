"use client";

import { motion } from "framer-motion";

/**
 * Animated scroll-down chevron indicator.
 */
export default function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      <span className="text-text-muted mb-1 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-amber-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.6 }}
        >
          <path d="M7 13l5 5 5-5" />
          <path d="M7 6l5 5 5-5" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
