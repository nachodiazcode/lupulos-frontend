"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText } from "./shared";
import { FEATURES } from "./data";

export default function CommunitySection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface-overlay) 0%, var(--color-surface-deepest) 50%, var(--color-surface-overlay) 100%)",
      }}
      aria-label="Comunidad"
    >
      {/* Ambient side glows */}
      <div
        className="pointer-events-none absolute top-1/4 left-0 h-80 w-80 -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "rgba(251,191,36,0.04)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-1/4 h-80 w-80 translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "rgba(52,211,153,0.03)" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/assets/personajes/teamlupulos.png"
                alt="Comunidad Lúpulos"
                width={380}
                height={320}
                unoptimized
                style={{
                  width: "100%",
                  maxWidth: 380,
                  height: "auto",
                  filter:
                    "drop-shadow(0 20px 50px rgba(0,0,0,0.3)) drop-shadow(0 0 30px rgba(251,191,36,0.08))",
                }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <SectionBadge>Comunidad activa</SectionBadge>
            <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Más que una app, <GradientText>una familia cervecera</GradientText>
            </h2>
            <p className="text-text-muted mt-4 text-sm leading-relaxed sm:text-base">
              Recomendaciones inteligentes, rankings, fotos, eventos y miles de cerveceros
              conectados cada día.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="group border-border-subtle hover:border-amber-primary/25 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300"
                  style={{ background: "var(--color-surface-card-alt)" }}
                >
                  <motion.span
                    className="shrink-0 text-xl leading-none"
                    aria-hidden="true"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feat.icon}
                  </motion.span>
                  <span className="text-text-secondary text-sm font-medium group-hover:text-text-primary transition-colors duration-200">
                    {feat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-9 inline-block"
            >
              <Link
                href="/auth/register"
                prefetch
                className="inline-block rounded-full px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:shadow-lg hover:brightness-110"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                Unirme a la comunidad
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
