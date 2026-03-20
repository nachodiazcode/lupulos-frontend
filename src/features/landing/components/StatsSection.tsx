"use client";

import { motion } from "framer-motion";
import { scaleIn, TiltCard } from "./shared";
import { STATS } from "./data";
import AnimatedCounter from "./AnimatedCounter";

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{ background: "var(--color-surface-deepest)" }}
      aria-label="Estadísticas de la comunidad"
    >
      {/* Animated top glow line */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4"
          style={{
            background: "var(--color-border-subtle)",
            boxShadow: "var(--shadow-amber-glow-lg)",
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
            >
              <TiltCard
                className="glass-card group relative flex flex-col items-center overflow-hidden px-6 py-14 text-center"
                style={{}}
                tiltDeg={8}
                glowColor="var(--shadow-amber-glow-color, rgba(251,191,36,0.1))"
              >
                <motion.span
                  className="relative text-4xl leading-none"
                  aria-hidden="true"
                  whileHover={{ scale: 1.3, rotate: 15, y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                >
                  {stat.icon}
                </motion.span>

                <AnimatedCounter
                  value={stat.value}
                  duration={2.2}
                  className="text-amber-primary relative mt-4 text-3xl font-black tracking-tight tabular-nums md:text-4xl"
                />

                <p className="text-text-muted relative mt-2 max-w-[120px] text-xs leading-snug font-medium transition-colors duration-300 group-hover:text-text-secondary">
                  {stat.label}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        aria-hidden="true"
      />
    </section>
  );
}
