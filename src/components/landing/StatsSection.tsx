"use client";

import { motion } from "framer-motion";
import { scaleIn } from "./shared";
import { STATS } from "./data";

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "var(--color-surface-deepest)" }}
      aria-label="Estadísticas de la comunidad"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4"
          style={{ background: "var(--color-border-subtle)" }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="bg-surface-deepest flex flex-col items-center px-6 py-11 text-center"
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {stat.icon}
              </span>
              <p className="text-amber-primary mt-3 text-3xl font-black tracking-tight tabular-nums md:text-4xl">
                {stat.value}
              </p>
              <p className="text-text-muted mt-1.5 max-w-[110px] text-xs leading-snug">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
