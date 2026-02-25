"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText } from "./shared";
import { FEATURES } from "./data";

export default function CommunitySection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface-overlay) 0%, var(--color-surface-deepest) 50%, var(--color-surface-overlay) 100%)",
      }}
      aria-label="Comunidad"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
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
                  maxWidth: 340,
                  height: "auto",
                  filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.28))",
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
            <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Más que una app, <GradientText>una familia cervecera</GradientText>
            </h2>
            <p className="text-text-muted mt-3 text-sm leading-relaxed">
              Recomendaciones inteligentes, rankings, fotos, eventos y miles de cerveceros
              conectados cada día.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {FEATURES.map((feat) => (
                <div
                  key={feat.label}
                  className="border-border-subtle hover:border-amber-primary/20 flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-px"
                  style={{ background: "var(--color-surface-card-alt)" }}
                >
                  <span className="shrink-0 text-lg leading-none" aria-hidden="true">
                    {feat.icon}
                  </span>
                  <span className="text-text-secondary text-xs font-medium">{feat.label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/auth/register"
              prefetch
              className="mt-7 inline-block rounded-full px-7 py-3 text-sm font-bold transition-all duration-300 hover:shadow-lg hover:brightness-110"
              style={{
                background: "var(--gradient-button-primary)",
                color: "var(--color-text-dark)",
                boxShadow: "var(--shadow-amber-glow)",
              }}
            >
              Unirme a la comunidad
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
