"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBeerTheme, BEER_THEMES } from "@/theme/ThemeContext";

/**
 * Theme switcher:
 * - Mobile: compact active-theme button → opens animated popover grid
 * - Desktop: horizontal pill list (unchanged feel)
 */
export default function ThemeSwitcher() {
  const { theme, setTheme } = useBeerTheme();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const activeTheme = BEER_THEMES.find((t) => t.id === theme) ?? BEER_THEMES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative flex items-center gap-2">
      {/* ── Desktop: horizontal pills ── */}
      <div className="hidden items-center gap-1 lg:flex">
        {BEER_THEMES.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={`Tema ${t.label}`}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-amber-primary/15 text-amber-primary ring-amber-primary/40 ring-1"
                  : "text-text-muted hover:bg-border-subtle hover:text-text-secondary"
              }`}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mobile: compact trigger button ── */}
      <motion.button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors duration-200 lg:hidden"
        style={{
          background: open
            ? "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)"
            : "color-mix(in srgb, var(--color-surface-card) 90%, transparent)",
          border: "1px solid var(--color-border-light)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.06)",
        }}
        whileTap={{ scale: 0.94 }}
        title={`Tema: ${activeTheme.label}`}
      >
        <motion.span
          key={activeTheme.id}
          className="text-[15px] leading-none"
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          {activeTheme.icon}
        </motion.span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          Tema
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.button>

      {/* ── Mobile popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            className="absolute right-0 top-full z-50 mt-2 lg:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <div
              className="rounded-2xl p-3"
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-border-amber)",
                boxShadow: "var(--shadow-elevated)",
                backdropFilter: "blur(20px) saturate(180%)",
                minWidth: 200,
              }}
            >
              <p
                className="mb-2.5 text-center text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Elige tu estilo
              </p>

              <div className="flex flex-col gap-1">
                {BEER_THEMES.map((t, i) => {
                  const isActive = theme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                      style={{
                        background: isActive
                          ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                          : "transparent",
                        border: isActive
                          ? "1px solid color-mix(in srgb, var(--color-amber-primary) 30%, transparent)"
                          : "1px solid transparent",
                      }}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[16px]"
                        style={{
                          background: isActive
                            ? "color-mix(in srgb, var(--color-amber-primary) 18%, transparent)"
                            : "var(--color-border-subtle)",
                          boxShadow: isActive
                            ? "0 2px 8px color-mix(in srgb, var(--color-amber-primary) 20%, transparent)"
                            : "none",
                        }}
                      >
                        {t.icon}
                      </span>
                      <span
                        className="text-[13px] font-semibold"
                        style={{
                          color: isActive
                            ? "var(--color-amber-primary)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {t.label}
                      </span>

                      {/* Active check */}
                      {isActive && (
                        <motion.span
                          className="ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-amber-primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
