"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, staggerContainer, popIn } from "./shared";
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
        style={{ background: "color-mix(in srgb, var(--color-amber-primary) 4%, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-1/4 h-80 w-80 translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "color-mix(in srgb, var(--color-emerald) 3%, transparent)" }}
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
              whileHover={{ scale: 1.05, rotate: -2 }}
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
                    "drop-shadow(0 20px 50px rgba(0,0,0,0.25)) drop-shadow(0 0 30px color-mix(in srgb, var(--color-amber-primary) 8%, transparent))",
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
            <SectionBadge>Para fans y creadores</SectionBadge>
            <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Todo lo que la cerveza artesanal <GradientText>necesitaba en un lugar</GradientText>
            </h2>
            <p className="text-text-muted mt-4 text-sm leading-relaxed sm:text-base">
              Un sommelier IA que aprende tu paladar. Una vitrina para cerveceros artesanales que quieren brillar.
              Rankings reales, eventos imperdibles y un mapa que el mundo cervecero pedía a gritos.
            </p>

            <motion.div
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {FEATURES.map((feat) => (
                <motion.div
                  key={feat.label}
                  variants={popIn}
                  whileHover={{ x: 6, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 transition-colors duration-300"
                  style={{
                    background: "var(--color-surface-card-alt)",
                    borderColor: "var(--color-border-subtle)",
                  }}
                >
                  {/* Left accent bar on hover */}
                  <div
                    className="absolute left-0 top-0 h-full w-0.5 scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                    style={{ background: "var(--gradient-button-primary)", transformOrigin: "top" }}
                  />
                  <motion.span
                    className="shrink-0 text-xl leading-none"
                    aria-hidden="true"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feat.icon}
                  </motion.span>
                  <span className="text-text-secondary group-hover:text-text-primary text-sm font-medium transition-colors duration-200">
                    {feat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-9 inline-block"
            >
              <Link
                href="/auth/register"
                prefetch
                className="group relative inline-block overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:shadow-lg hover:brightness-110"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                <span className="relative z-10">Quiero ser parte</span>
                <span
                  className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-600 group-hover:translate-x-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
