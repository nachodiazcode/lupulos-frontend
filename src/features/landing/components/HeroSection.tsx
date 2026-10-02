"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import AiPromptBar from "./AiPromptBar";

/* ═══════════════════════════════════
   Bubbles
   ═══════════════════════════════════ */

interface Sparkle {
  id: number;
  char: string;
  size: number;
  left: string;
  duration: number;
  delay: number;
  opacity: number;
  rotate: number;
}

const SPARKLE_CHARS = ["\u2726", "\u2727", "\u22c6", "\u273a", "\u00b7", "\u2726"];

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
    size: 9 + Math.random() * 14,
    left: `${(Math.random() * 96).toFixed(1)}%`,
    duration: 5 + Math.random() * 8,
    delay: Math.random() * 10,
    opacity: 0.22 + Math.random() * 0.36,
    rotate: Math.random() * 360,
  }));
}

/* ═══════════════════════════════════
   Data
   ═══════════════════════════════════ */

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function HeroSection() {
  const { user, isAuthReady } = useAuth();
  const sparkles = useMemo(() => generateSparkles(22), []);
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "min(100dvh, 800px)", background: "var(--gradient-hero)" }}
    >
      {/* ── Blobs animados — fondo vivo ── */}
      <motion.div
        className="pointer-events-none absolute rounded-full blur-[130px]"
        style={{
          width: 640, height: 640,
          background: "radial-gradient(circle, rgba(249,115,22,0.28) 0%, rgba(251,191,36,0.14) 50%, transparent 70%)",
          top: "-15%", right: "-8%",
        }}
        animate={{ x: [0, 48, -28, 20, 0], y: [0, -30, 40, -16, 0], scale: [1, 1.14, 0.88, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute rounded-full blur-[110px]"
        style={{
          width: 520, height: 520,
          background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(249,115,22,0.10) 55%, transparent 75%)",
          bottom: "0%", left: "-8%",
        }}
        animate={{ x: [0, -40, 26, -15, 0], y: [0, 26, -36, 18, 0], scale: [1, 0.92, 1.12, 0.96, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        aria-hidden
      />

      {/* ✨ Shimmer mágico — más drámtico, pausa entre pasadas */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(108deg, transparent 28%, rgba(255,195,90,0.13) 48%, rgba(249,115,22,0.09) 52%, transparent 72%)",
          backgroundSize: "250% 100%",
        }}
        animate={{ backgroundPosition: ["220% 0%", "-80% 0%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
        aria-hidden
      />
      {/* Blob 3 — coral mágico central */}
      <motion.div
        className="pointer-events-none absolute rounded-full blur-[100px]"
        style={{
          width: 380, height: 380,
          background: "radial-gradient(circle, rgba(239,98,44,0.20) 0%, rgba(249,115,22,0.09) 55%, transparent 75%)",
          top: "38%", left: "44%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ x: [0, 38, -24, 14, 0], y: [0, -24, 30, -12, 0], scale: [1, 1.24, 0.86, 1.12, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        aria-hidden
      />

      {/* ✨ Sparkles mágicos giratorios */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {sparkles.map((s) => (
            <motion.span
              key={s.id}
              className="absolute select-none"
              style={{
                fontSize: s.size,
                left: s.left,
                bottom: -30,
                lineHeight: 1,
                color:
                  s.id % 3 === 0 ? "#f97316"
                  : s.id % 3 === 1 ? "#fbbf24"
                  : "#fb923c",
              }}
              animate={{
                y: [0, -900],
                opacity: [0, s.opacity, s.opacity * 0.7, 0],
                rotate: [s.rotate, s.rotate + 360],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeOut",
              }}
            >
              {s.char}
            </motion.span>
          ))}
        </div>
      )}

      {/* ─── Content ─── */}
      <div className="home-content-shell relative z-10 px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.84fr)] lg:gap-9 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.84fr)] xl:gap-12 3xl:max-w-[110rem] 3xl:mx-auto">

          {/* ── LEFT: Text + AI ── */}
          <div className="mx-auto flex w-full min-w-0 max-w-[34rem] flex-col text-center lg:mx-0 lg:max-w-[35rem] lg:text-left xl:max-w-[37rem] 2xl:max-w-[42rem]">

            {/* Badge */}
            <motion.span
              className="inline-block self-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-3 py-1.5 text-[8px] font-semibold tracking-[0.08em] uppercase backdrop-blur-sm sm:px-4 sm:text-[11px] sm:tracking-[0.2em] lg:self-start"
              style={{
                borderColor: "var(--color-border-amber)",
                background: "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)",
                color: "var(--color-amber-dark)",
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              La aplicación web de la cerveza · Nacida en Stgo de Chile 🇨🇱
            </motion.span>

            {/* H1 */}
            <motion.h1
              className="text-text-primary mt-2 text-[2rem] leading-[1.05] font-extrabold tracking-[-0.04em] min-[375px]:text-[2.35rem] sm:text-[3rem] sm:leading-[1] sm:tracking-[-0.05em] md:text-[3.4rem] lg:text-[3.05rem] xl:text-[3.35rem] 2xl:text-[3.55rem] min-[1920px]:text-[4rem]"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="hero-shimmer-text relative inline-block" style={{
                textShadow: "0.6px 0.6px 0 currentColor, -0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0 -0.6px 0 currentColor",
                backgroundImage: "linear-gradient(90deg, currentColor 0%, currentColor 35%, #fbbf24 48%, #f59e0b 50%, #fbbf24 52%, currentColor 65%, currentColor 100%)",
                backgroundSize: "250% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "hero-shimmer 4s ease-in-out infinite",
                animationDelay: "1.5s",
              }}>La comunidad que los</span>
              <br className="hidden sm:block" />
              <motion.span
                className="relative inline-block px-2"
                animate={{ rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="absolute inset-0 block rounded-2xl opacity-20 blur-xl" style={{ background: "var(--gradient-button-primary)" }} />
                <span className="relative italic" style={{
                  color: "var(--color-amber-primary)",
                  textShadow: "0 0 30px rgba(251,191,36,0.5)",
                }}>
                  amantes de la cerveza
                </span>
              </motion.span>
              <br className="hidden sm:block" />
              <span className="hero-shimmer-text relative inline-block" style={{
                textShadow: "0.6px 0.6px 0 currentColor, -0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0 -0.6px 0 currentColor",
                backgroundImage: "linear-gradient(90deg, currentColor 0%, currentColor 35%, #fbbf24 48%, #f59e0b 50%, #fbbf24 52%, currentColor 65%, currentColor 100%)",
                backgroundSize: "250% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "hero-shimmer 4s ease-in-out infinite",
                animationDelay: "1.5s",
              }}>estaban esperando</span>
            </motion.h1>
            {/* Subtitle */}
            <motion.p
              className="text-text-secondary mt-3 text-[0.78rem] font-semibold leading-[1.6] sm:mt-4 sm:text-[0.95rem] sm:leading-[1.72] lg:text-[1rem] 2xl:text-[1.05rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
            >
              Descubre cervezas artesanales, comparte lo que estás tomando y conecta con personas que, como tú, viven la cerveza en serio.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-6 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:items-start"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55 }}
            >
              {!isLoggedIn && isAuthReady && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Link
                    href="/auth/login?plan=plus"
                    prefetch
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border px-7 py-3 text-center text-sm font-bold shadow-xl transition-all duration-300 sm:inline-flex sm:w-auto sm:px-8 sm:text-[15px]"
                    style={{
                      background: "linear-gradient(135deg, color-mix(in srgb, var(--color-amber-primary) 15%, transparent), color-mix(in srgb, var(--color-amber-dark) 8%, transparent))",
                      borderColor: "var(--color-border-amber)",
                      color: "var(--color-amber-dark)",
                      boxShadow: "0 4px 24px color-mix(in srgb, var(--color-amber-primary) 20%, transparent)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 shrink-0">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="relative z-10">Iniciar con Lúpulos Plus</span>
                    <span
                      className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-[600ms] group-hover:translate-x-full"
                      style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-primary) 15%, transparent), transparent)" }}
                    />
                  </Link>
                </motion.div>
              )}

              {!isLoggedIn && isAuthReady && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto relative">
                  <motion.div
                    className="absolute -inset-1 rounded-full blur-md opacity-60"
                    style={{ background: "linear-gradient(135deg, var(--color-orange-cta), var(--color-orange-cta-hover))" }}
                    animate={{ scale: [0.98, 1.05, 0.98], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <Link
                    href="/auth/register"
                    prefetch
                    className="group relative block w-full overflow-hidden rounded-full px-7 py-3 text-center text-sm font-bold shadow-xl transition-all duration-300 sm:inline-block sm:w-auto sm:px-8 sm:text-[15px] border border-white/20"
                    style={{
                      background: "linear-gradient(135deg, var(--color-orange-cta), var(--color-orange-cta-hover))",
                      color: "#ffffff",
                      boxShadow: "0 4px 24px color-mix(in srgb, var(--color-orange-cta) 45%, transparent)",
                    }}
                  >
                    <span className="relative z-10">Unirme gratis</span>
                    <span
                      className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-[600ms] group-hover:translate-x-full"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                    />
                  </Link>
                </motion.div>
              )}

            </motion.div>

            {/* ── Divider + AI Prompt Bar ── */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, duration: 0.55 }}
            >
              <motion.div
                className="mx-auto mb-4 h-px w-full max-w-xl lg:mx-0"
                style={{
                  background: "linear-gradient(90deg, rgba(249,115,22,0.32), rgba(251,191,36,0.22), transparent)",
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.82, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />

              <div className="w-full max-w-[34rem] lg:max-w-[33rem] xl:max-w-[35rem]">
                <AiPromptBar embedded />
              </div>
            </motion.div>

            {/* ── Mobile Hero Image ── */}
            <motion.div
              className="relative mt-6 overflow-hidden rounded-2xl lg:hidden"
              style={{
                border: "1px solid color-mix(in srgb, var(--color-border-amber) 40%, var(--color-border-light))",
                boxShadow: "0 8px 32px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src="/assets/vikingos-cerveza.webp"
                  alt="Cerveceros disfrutando cerveza artesanal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md"
                    style={{ background: "rgba(249,115,22,0.85)", color: "#ffffff" }}
                  >
                    🍺 +1.200 cervezas
                  </span>
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#ffffff" }}
                  >
                    📍 280+ locales
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Principales funciones (mobile only Bento Box) ── */}
            <motion.div
              className="mt-8 mb-4 lg:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.55 }}
            >
              <p className="mb-5 text-center text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: "var(--color-text-muted)" }}>
                Experiencia Lúpulos
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: "🍺", title: "Catálogo", desc: "Estilo, IBU y ABV", gradient: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(251,191,36,0.05))", glowColor: "rgba(249,115,22,0.3)" },
                  { icon: "🗺️", title: "Mapa", desc: "Cervecerías cerca", gradient: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.05))", glowColor: "rgba(34,197,94,0.25)" },
                  { icon: "✨", title: "Buscador IA", desc: "Catálogo inteligente", gradient: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(139,92,246,0.05))", glowColor: "rgba(168,85,247,0.3)" },
                  { icon: "🏆", title: "Rankings", desc: "Top comunidad", gradient: "linear-gradient(135deg, rgba(234,179,8,0.18), rgba(251,191,36,0.05))", glowColor: "rgba(234,179,8,0.3)" },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 350, damping: 25 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-[2rem] px-4 py-6 text-center"
                    style={{
                      background: f.gradient,
                      backdropFilter: "blur(24px) saturate(1.2)",
                      WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                      border: "1px solid color-mix(in srgb, var(--color-border-amber) 30%, rgba(255,255,255,0.1))",
                      boxShadow: `0 8px 32px ${f.glowColor}, inset 0 2px 0 rgba(255,255,255,0.15)`,
                    }}
                  >
                    <motion.span
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-[28px] leading-none"
                      style={{
                        background: "color-mix(in srgb, var(--color-surface-card) 95%, transparent)",
                        boxShadow: `0 4px 16px ${f.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}
                      animate={{ scale: [1, 1.06, 1], y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                    >
                      {f.icon}
                    </motion.span>
                    <div>
                      <p className="text-[14px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>{f.title}</p>
                      <p className="mt-1 text-[11px] leading-snug opacity-80" style={{ color: "var(--color-text-muted)" }}>{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Scroll down indicator with pulse glow */}
              <motion.div className="mt-7 flex justify-center">
                <motion.button
                  onClick={() => {
                    const next = document.querySelector('[aria-label="Comunidad"]');
                    if (!next) {
                      const sections = document.querySelectorAll("section");
                      if (sections[1]) sections[1].scrollIntoView({ behavior: "smooth" });
                    } else {
                      next.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--color-amber-primary) 15%, transparent), color-mix(in srgb, var(--color-amber-dark) 10%, transparent))",
                    border: "1.5px solid var(--color-border-amber)",
                    color: "var(--color-amber-dark)",
                    backdropFilter: "blur(12px)",
                  }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  aria-label="Ver más"
                >
                  {/* Pulse ring */}
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1.5px solid var(--color-amber-primary)" }}
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT: Hero image ── */}
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden w-full max-w-sm lg:block lg:max-w-none lg:mt-12 perspective-[1200px]"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="pointer-events-none absolute -inset-6 rounded-[3rem] blur-[60px]"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--color-amber-primary) 30%, transparent), transparent 70%)",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              />

              <div
                className="glass-card relative overflow-hidden rounded-[2.5rem] border p-2.5 transition-transform duration-500 hover:scale-[1.02]"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, var(--color-border-light))",
                  boxShadow: "var(--shadow-amber-glow-lg), inset 0 2px 0 rgba(255,255,255,0.15)",
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                  <Image
                    src="/assets/vikingos-cerveza.webp"
                    alt="Cerveceros disfrutando cerveza artesanal"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 38vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)",
                    }}
                  />
                  
                  {/* Floating badge 1 */}
                  <motion.div
                    className="absolute top-6 left-6 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      borderColor: "rgba(255,255,255,0.15)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                      color: "#ffffff",
                    }}
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px]">🔥</span>
                    <span className="text-[12px] font-bold" style={{ color: "#ffffff" }}>+8.5K Cerveceros</span>
                  </motion.div>

                  {/* Floating testimonial card */}
                  <div className="absolute right-4 bottom-5 left-4">
                    <motion.div
                      className="rounded-2xl p-4"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,0,0,0.65), rgba(0,0,0,0.4))",
                        borderColor: "rgba(255,255,255,0.15)",
                        borderWidth: "1px",
                        backdropFilter: "blur(24px) saturate(1.2)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                      }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-6 w-6 rounded-full border border-white/20 bg-gradient-to-br from-amber-400 to-orange-500" />
                          ))}
                        </div>
                        <div className="flex text-[10px] text-amber-400">
                          ★★★★★
                        </div>
                      </div>
                      <p className="text-[14px] font-bold leading-tight tracking-tight drop-shadow-md" style={{ color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                        &quot;Encontré mi cerveza favorita en 5 minutos. Esta comunidad es otro nivel&quot; 🍺
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
