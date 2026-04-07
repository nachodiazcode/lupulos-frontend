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
  },
  {
    icon: "📍",
    title: "Mapa cervecero",
    tagline: "Taprooms y cervecerías verificados",
    href: "/lugares",
    bg: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)",
    ring: "rgba(239,68,68,0.45)",
    glow: "rgba(239,68,68,0.15)",
  },
  {
    icon: "💬",
    title: "Comunidad",
    tagline: "Comparte, opina y descubre",
    href: "/posts",
    bg: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)",
    ring: "rgba(52,211,153,0.45)",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    icon: "🧠",
    title: "Lupu-AI",
    tagline: "IA especializada en cerveza artesanal",
    href: "/auth/register",
    bg: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
    ring: "rgba(139,92,246,0.45)",
    glow: "rgba(139,92,246,0.15)",
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
          <div className="mb-10 text-center">
            <SectionBadge>Todo en un lugar</SectionBadge>
            <h2 className="text-text-primary mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <GradientText>Descubre Lúpulos</GradientText>
            </h2>
          </div>

          {/* Icon circles grid */}
          <motion.div
            className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6"
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
                    className="relative flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
                    style={{
                      background: item.bg,
                      boxShadow: `0 0 0 1.5px ${item.ring}, 0 8px 32px ${item.glow}`,
                    }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    {/* Pulse ring on hover */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                      style={{ boxShadow: `0 0 0 6px ${item.ring}` }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden="true"
                    />
                    <span className="text-3xl sm:text-4xl" role="img">{item.icon}</span>
                  </motion.div>

                  {/* Text */}
                  <div>
                    <p className="text-text-primary text-base font-black leading-tight sm:text-lg">
                      {item.title}
                    </p>
                    <p
                      className="mt-1.5 max-w-[140px] text-xs leading-snug sm:text-sm"
                      style={{ color: "color-mix(in srgb, var(--color-text-secondary) 80%, transparent)" }}
                    >
                      {item.tagline}
                    </p>
                  </div>
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
