"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, GradientText, AmberDivider } from "./shared";
import { QUOTES } from "./data";

export default function CtaSection() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-36"
      style={{ background: "var(--gradient-section-darker)" }}
      aria-label="Llamada a acción"
    >
      {/* Multiple ambient glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{ background: "var(--color-amber-primary)", opacity: 0.06 }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "var(--color-orange-cta)" }}
        aria-hidden="true"
      />

      <AmberDivider className="absolute top-0 left-1/2 w-2/3 -translate-x-1/2 opacity-60" />

      <div className="home-content-shell relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div
              className="mb-2 text-5xl leading-none font-black opacity-15 select-none sm:text-7xl"
              style={{ color: "var(--color-amber-primary)", fontFamily: "Georgia, serif" }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            <motion.p
              className="text-text-secondary text-lg leading-relaxed font-light tracking-wide italic sm:text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            >
              {quote}
            </motion.p>

            <div
              className="mx-auto mt-6 h-px w-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
              }}
              aria-hidden="true"
            />

            <h2 className="text-text-primary mt-10 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <GradientText>Solo falta tu nombre en la mesa</GradientText>
            </h2>
            <p className="text-text-muted mt-3 text-base">
              Da igual si destapas o si fabricas — acá tu pasión por la cerveza artesanal tiene nombre, comunidad y un lugar que la honra.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              {/* Primary CTA with shimmer */}
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href="/auth/register"
                  prefetch
                  className="group relative block w-full overflow-hidden rounded-full px-10 py-4 text-center text-sm font-bold shadow-xl transition-all duration-300 hover:brightness-110 sm:inline-block sm:w-auto"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  <span className="relative z-10">Empezar ahora — es gratis</span>
                  <span
                    className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-600 group-hover:translate-x-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                  />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/auth/login"
                  prefetch
                  className="group relative block w-full overflow-hidden rounded-full border px-10 py-4 text-center text-sm font-medium backdrop-blur-sm transition-all duration-300 sm:inline-block sm:w-auto"
                  style={{
                    borderColor: "var(--color-border-medium)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-primary">
                    Ya soy parte →
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
