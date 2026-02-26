"use client";

import { motion } from "framer-motion";
import { scaleIn } from "./shared";
import { STATS } from "./data";
import AnimatedCounter from "./AnimatedCounter";

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{ background: "var(--color-surface-deepest)" }}
      aria-label="Estadísticas de la comunidad"
    >
      {/* Decorative top/bottom glow lines */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4"
          style={{
            background: "var(--color-border-subtle)",
            boxShadow:
              "0 0 80px rgba(251, 191, 36, 0.04), 0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="group relative flex flex-col items-center px-6 py-14 text-center transition-all duration-500"
              style={{ background: "var(--color-surface-deepest)" }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 50% 40%, rgba(251,191,36,0.06), transparent 70%)",
                }}
                aria-hidden="true"
              />

              <motion.span
                className="relative text-4xl leading-none"
                aria-hidden="true"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.icon}
              </motion.span>

              <AnimatedCounter
                value={stat.value}
                duration={2.2}
                className="text-amber-primary relative mt-4 text-3xl font-black tracking-tight tabular-nums md:text-4xl"
              />

              <p className="text-text-muted relative mt-2 max-w-[120px] text-xs leading-snug font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </section>
  );
}
