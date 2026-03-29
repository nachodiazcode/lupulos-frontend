"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "./shared";

/* ═══════════════════════════════════
   Magic Newsletter Form
   ═══════════════════════════════════ */

function MagicNewsletterForm() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative mx-auto max-w-md"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 rounded-2xl border p-4 text-center"
            style={{
              background: "color-mix(in srgb, var(--color-emerald) 8%, var(--color-surface-card))",
              borderColor: "color-mix(in srgb, var(--color-emerald) 30%, transparent)",
            }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6 }}
              className="text-2xl"
            >
              🎉
            </motion.span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-emerald)" }}>
              ¡Estás dentro! El próximo martes arrancamos.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="magic-input-wrapper relative"
          >
            {/* Animated gradient border — blurred glow layer */}
            <motion.div
              className="absolute -inset-[2px] rounded-2xl"
              animate={{
                opacity: focused ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              style={{
                background:
                  "conic-gradient(from 0deg, var(--color-amber-primary), var(--color-emerald), var(--color-orange-cta), var(--color-amber-primary))",
                filter: "blur(4px)",
                animation: focused ? "magic-gradient-shift 3s linear infinite" : "none",
                backgroundSize: "200% 200%",
              }}
            />
            {/* Animated gradient border — crisp layer */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl"
              animate={{
                opacity: focused ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              style={{
                background:
                  "conic-gradient(from 0deg, var(--color-amber-primary), var(--color-emerald), var(--color-orange-cta), var(--color-amber-primary))",
                animation: focused ? "magic-gradient-shift 3s linear infinite" : "none",
                backgroundSize: "200% 200%",
              }}
            />

            <div
              className="relative flex items-center gap-2 rounded-2xl border px-4 py-2.5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: focused ? "transparent" : "var(--color-border-light)",
                boxShadow: focused
                  ? "0 0 30px color-mix(in srgb, var(--color-amber-primary) 15%, transparent), 0 0 60px color-mix(in srgb, var(--color-amber-primary) 5%, transparent)"
                  : "none",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
              }}
            >
              <motion.span
                animate={focused ? { rotate: [0, 14, -14, 0], scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg"
              >
                ✉️
              </motion.span>
              <input
                ref={inputRef}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
                style={{ color: "var(--color-text-primary)" }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative shrink-0 overflow-hidden rounded-xl px-5 py-2 text-xs font-bold transition-all duration-300"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                <span className="relative z-10">Unirme</span>
                <span
                  className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-600 group-hover:translate-x-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-text-ghost mt-2 text-center text-[10px]">
        Sin spam. Solo lúpulo, malta y cosas que valen la pena.
      </p>
    </motion.form>
  );
}

/* ═══════════════════════════════════
   Newsletter Banner Component
   ═══════════════════════════════════ */

export default function NewsletterBanner() {
  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface-overlay) 0%, var(--color-surface-deepest) 50%, var(--color-surface-overlay) 100%)",
      }}
      aria-label="Newsletter"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        style={{ background: "color-mix(in srgb, var(--color-amber-primary) 8%, transparent)" }}
        aria-hidden="true"
      />

      <div className="home-content-shell relative z-10">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-text-primary text-2xl font-black sm:text-3xl">
            El correo que los cerveceros sí abren <span className="inline-block">🍻</span>
          </h3>
          <p className="text-text-secondary mx-auto mt-3 max-w-2xl text-base font-semibold leading-relaxed sm:text-lg">
            Cada martes: lanzamientos exclusivos, hallazgos de la comunidad y la cerveza que no sabías que necesitabas.
          </p>

          <div className="mt-6">
            <MagicNewsletterForm />
          </div>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/auth/register"
                prefetch
                className="group relative block w-full overflow-hidden rounded-full px-9 py-4 text-center text-sm font-bold transition-all duration-300 hover:shadow-xl hover:brightness-110 sm:inline-block sm:w-auto"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                <span className="relative z-10">Quiero ser parte</span>
                <span
                  className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-600 group-hover:translate-x-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                  }}
                />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/cervezas"
                prefetch
                className="block w-full rounded-full border px-9 py-4 text-center text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:brightness-110 sm:inline-block sm:w-auto"
                style={{
                  borderColor: "var(--color-border-medium)",
                  color: "var(--color-text-muted)",
                }}
              >
                Explorar sin cuenta →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
