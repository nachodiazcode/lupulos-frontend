"use client";

import { motion } from "framer-motion";

/**
 * Scroll indicator — circular button with orange arrow + pulsing ring.
 */
export default function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      <span
        className="text-[9px] tracking-[0.22em] uppercase"
        style={{ color: "var(--color-orange-cta, #f97316)", opacity: 0.7 }}
      >
        Scroll
      </span>

      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <motion.span
          className="absolute rounded-full"
          style={{
            width: 56,
            height: 56,
            border: "1px solid rgba(249, 115, 22, 0.35)",
          }}
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Circle button */}
        <motion.div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            border: "1.5px solid rgba(249, 115, 22, 0.65)",
            background:
              "radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.06) 60%, transparent 100%)",
          }}
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-orange-cta, #f97316)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
