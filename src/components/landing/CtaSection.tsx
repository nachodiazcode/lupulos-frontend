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
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "var(--gradient-section-darker)" }}
      aria-label="Llamada a acción"
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--color-amber-primary)" }}
        aria-hidden="true"
      />

      <AmberDivider className="absolute top-0 left-1/2 w-2/3 -translate-x-1/2 opacity-60" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div
              className="mb-2 text-7xl leading-none font-black opacity-15 select-none"
              style={{ color: "var(--color-amber-primary)", fontFamily: "Georgia, serif" }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            <p className="text-text-secondary text-lg leading-relaxed font-light tracking-wide italic sm:text-xl">
              {quote}
            </p>

            <div
              className="mx-auto mt-6 h-px w-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
              }}
              aria-hidden="true"
            />

            <h2 className="text-text-primary mt-10 text-2xl font-extrabold tracking-tight sm:text-3xl">
              ¿Listo para tu próxima <GradientText>cerveza favorita?</GradientText>
            </h2>
            <p className="text-text-muted mt-3 text-sm">
              Únete gratis a la comunidad cervecera más grande de Chile.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                prefetch
                className="hover:shadow-amber-primary/25 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition-all duration-300 hover:brightness-110"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                }}
              >
                Crear mi cuenta gratis
              </Link>

              <Link
                href="/auth/login"
                prefetch
                className="border-border-medium text-text-muted hover:border-amber-primary/40 hover:text-amber-primary rounded-full border px-8 py-3.5 text-sm font-medium backdrop-blur-sm transition-all duration-200"
              >
                Ya tengo cuenta →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
