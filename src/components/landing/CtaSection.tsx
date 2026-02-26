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
      className="relative overflow-hidden py-28 sm:py-36"
      style={{ background: "var(--gradient-section-darker)" }}
      aria-label="Llamada a acción"
    >
      {/* Multiple ambient glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{ background: "var(--color-amber-primary)", opacity: 0.08 }}
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
              ¿Listo para tu próxima <GradientText>cerveza favorita?</GradientText>
            </h2>
            <p className="text-text-muted mt-3 text-base">
              Únete gratis a la comunidad cervecera más grande de Chile.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* Primary CTA with pulsating glow */}
              <motion.div className="relative">
                {/* Pulsing ring */}
                <motion.div
                  className="absolute -inset-1 rounded-full"
                  animate={{
                    boxShadow: [
                      "0 0 20px 2px rgba(251,191,36,0.0)",
                      "0 0 30px 8px rgba(251,191,36,0.25)",
                      "0 0 20px 2px rgba(251,191,36,0.0)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                />
                <Link
                  href="/auth/register"
                  prefetch
                  className="relative inline-block rounded-full px-10 py-4 text-sm font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:brightness-110"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "0 8px 30px rgba(251,191,36,0.3)",
                  }}
                >
                  Crear mi cuenta gratis
                </Link>
              </motion.div>

              <Link
                href="/auth/login"
                prefetch
                className="border-border-medium text-text-muted hover:border-amber-primary/40 hover:text-amber-primary rounded-full border px-10 py-4 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105"
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
