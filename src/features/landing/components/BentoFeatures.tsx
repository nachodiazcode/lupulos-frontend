"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionBadge, GradientText, fadeUp, staggerContainer } from "./shared";

/* ═══════════════════════════════════
   Data
   ═══════════════════════════════════ */

const ITEMS = [
  {
    icon: "🍺",
    title: "Catálogo",
    tagline: "Cervezas artesanales chilenas",
    href: "/cervezas",
    bg: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)",
    ring: "rgba(251,191,36,0.45)",
    glow: "rgba(251,191,36,0.18)",
    mobileBg: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(249,115,22,0.06))",
    mobileAccent: "#f59e0b",
  },
  {
    icon: "📍",
    title: "Mapa cervecero",
    tagline: "Taprooms y cervecerías verificados",
    href: "/lugares",
    bg: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)",
    ring: "rgba(239,68,68,0.45)",
    glow: "rgba(239,68,68,0.15)",
    mobileBg: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(249,115,22,0.05))",
    mobileAccent: "#ef4444",
  },
  {
    icon: "💬",
    title: "Comunidad",
    tagline: "Comparte, opina y descubre",
    href: "/posts",
    bg: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)",
    ring: "rgba(52,211,153,0.45)",
    glow: "rgba(52,211,153,0.15)",
    mobileBg: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.05))",
    mobileAccent: "#34d399",
  },
  {
    icon: "🧠",
    title: "Lupu-AI",
    tagline: "IA especializada en cerveza artesanal",
    href: "/auth/register",
    bg: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
    ring: "rgba(139,92,246,0.45)",
    glow: "rgba(139,92,246,0.15)",
    mobileBg: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(168,85,247,0.05))",
    mobileAccent: "#8b5cf6",
  },
] as const;

/* ═══════════════════════════════════
   Section
   ═══════════════════════════════════ */

export default function BentoFeatures() {
  return (
    <section
      className="relative py-20 sm:py-24"
      style={{ background: "var(--color-surface-deepest)" }}
      aria-label="Características principales"
    >
      {/* Top separator */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div className="home-content-shell">
        <motion.div
          className="glass-card overflow-hidden rounded-3xl border px-5 py-8 sm:px-12 sm:py-12"
          style={{ borderColor: "var(--color-border-subtle)" }}
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Section header */}
          <div className="mb-8 text-center sm:mb-10">
            <SectionBadge>Todo en un lugar</SectionBadge>
            <h2 className="text-text-primary mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <GradientText>Descubre Lúpulos</GradientText>
            </h2>
          </div>

          {/* ── Desktop: Icon circles grid (sm+) ── */}
          <motion.div
            className="hidden grid-cols-4 gap-6 sm:grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i + 1}
                className="flex flex-col items-center text-center"
              >
                <Link href={item.href} className="group flex flex-col items-center gap-4">
                  {/* Circle */}
                  <motion.div
                    className="relative flex h-24 w-24 items-center justify-center rounded-full"
                    style={{
                      background: item.bg,
                      boxShadow: `0 0 0 1.5px ${item.ring}, 0 8px 32px ${item.glow}`,
                    }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                      style={{ boxShadow: `0 0 0 6px ${item.ring}` }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden="true"
                    />
                    <span className="text-4xl" role="img">{item.icon}</span>
                  </motion.div>

                  <div>
                    <p className="text-text-primary text-lg font-black leading-tight">
                      {item.title}
                    </p>
                    <p
                      className="mt-1.5 max-w-[140px] text-sm leading-snug"
                      style={{ color: "color-mix(in srgb, var(--color-text-secondary) 80%, transparent)" }}
                    >
                      {item.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Mobile: Horizontal feature cards ── */}
          <motion.div
            className="flex flex-col gap-3 sm:hidden"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i + 1}
              >
                <Link
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: item.mobileBg,
                    border: `1px solid color-mix(in srgb, ${item.mobileAccent} 18%, var(--color-border-light))`,
                    boxShadow: `0 2px 12px color-mix(in srgb, ${item.mobileAccent} 10%, transparent)`,
                  }}
                >
                  {/* Icon container */}
                  <motion.span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[24px]"
                    style={{
                      background: "color-mix(in srgb, var(--color-surface-card) 92%, transparent)",
                      boxShadow: `0 2px 10px color-mix(in srgb, ${item.mobileAccent} 16%, transparent)`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    {item.icon}
                  </motion.span>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[14px] font-extrabold leading-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="mt-0.5 text-[12px] leading-snug"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.tagline}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-subtle)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </section>
  );
}
