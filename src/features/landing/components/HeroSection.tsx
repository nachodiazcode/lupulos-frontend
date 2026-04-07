"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
   Word Cycler
   ═══════════════════════════════════ */

const ACTION_WORDS = [
  "descubrir", "compartir", "explorar", "conectar",
] as const;

function BeerStyleCycler() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = ACTION_WORDS[wordIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setWordIdx((i) => (i + 1) % ACTION_WORDS.length);
    } else if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      }, 45);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }, 110);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIdx]);

  return (
    <span className="relative inline-block align-baseline" aria-live="polite" style={{ minWidth: "10ch" }}>
      <span
        className="font-black inline-block align-baseline"
        style={{
          background: "linear-gradient(135deg, #ea580c, #f97316, #fbbf24, #c084fc, #a855f7, #7c3aed, #ea580c)",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "magic-gradient-shift 5s ease-in-out infinite",
          textShadow: "none",
        }}
      >
        {displayText}
      </span>
      <motion.span
        className="inline-block"
        style={{
          width: "3px",
          height: "0.85em",
          background: "linear-gradient(180deg, #f59e0b, #d97706)",
          marginLeft: "2px",
          verticalAlign: "baseline",
          borderRadius: "1.5px",
          display: "inline-block",
        }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </span>
  );
}

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function HeroSection() {
  const sparkles = useMemo(() => generateSparkles(22), []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: "min(86vh, 720px)", background: "var(--gradient-hero)" }}
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
      <div className="home-content-shell relative z-10 py-8 sm:py-10 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.84fr)] lg:gap-9 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.84fr)] xl:gap-12">

          {/* ── LEFT: Text + AI ── */}
          <div className="mx-auto flex w-full max-w-[34rem] flex-col text-center lg:mx-0 lg:max-w-[35rem] lg:text-left xl:max-w-[37rem]">

            {/* Badge */}
            <motion.span
              className="inline-block rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
              style={{
                borderColor: "var(--color-border-amber)",
                background: "rgba(249,115,22,0.1)",
                color: "var(--color-amber-primary)",
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              🍺 Red social de cerveza artesanal · Chile
            </motion.span>

            {/* H1 */}
            <motion.h1
              className="text-text-primary mt-2 text-[1.9rem] leading-[1.05] font-black tracking-[-0.04em] sm:text-[2.5rem] sm:leading-[1.03] sm:tracking-[-0.05em] md:text-[2.95rem] lg:text-[3.05rem] xl:text-[3.35rem] 2xl:text-[3.55rem]"
              style={{ textShadow: "0.6px 0.6px 0 currentColor, -0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0 -0.6px 0 currentColor" }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Una nueva red social para amantes de la cerveza 🍺
            </motion.h1>
            {/* Subtitle */}
            <motion.p
              className="text-text-secondary mt-4 max-w-[35rem] text-[0.95rem] font-semibold leading-[1.72] sm:text-[0.98rem] lg:text-[1rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
            >
              Lúpulos es la comunidad chilena de cerveza artesanal. Encuentra cervezas con ficha completa, descubre cervecerías verificadas cerca de ti y conecta con miles de apasionados — todo gratis.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-6 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:items-start"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/auth/register"
                  prefetch
                  className="group relative block w-full overflow-hidden rounded-full px-7 py-3 text-center text-sm font-bold shadow-xl transition-all duration-300 sm:inline-block sm:w-auto sm:px-8 sm:text-[15px]"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#ffffff",
                    boxShadow: "0 4px 24px rgba(249,115,22,0.45)",
                  }}
                >
                  <span className="relative z-10">Unirme gratis</span>
                  <span
                    className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-[600ms] group-hover:translate-x-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                  />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/cervezas"
                  prefetch
                  className="block w-full rounded-full border px-7 py-3 text-center text-sm font-medium transition-all duration-300 sm:inline-block sm:w-auto sm:px-8 sm:text-[15px]"
                  style={{
                    borderColor: "var(--color-border-amber)",
                    background: "rgba(249,115,22,0.07)",
                    color: "var(--color-amber-primary)",
                  }}
                >
                  Explorar cervezas →
                </Link>
              </motion.div>
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

            {/* ── Feature strip (mobile only) ── */}
            <motion.div
              className="mt-6 lg:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.55 }}
            >
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>Todo lo que incluye</p>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                {[
                  { icon: "🍺", title: "Catálogo",    desc: "Busca por estilo, IBU y ABV" },
                  { icon: "🗺️", title: "Mapa",        desc: "Cervecerías cerca de ti" },
                  { icon: "✨", title: "IA Sommelier", desc: "Recomendaciones personalizadas" },
                  { icon: "🏆", title: "Rankings",    desc: "Las más amadas de la comunidad" },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.08 + i * 0.07, type: "spring", stiffness: 260, damping: 24 }}
                    className="flex w-[140px] shrink-0 flex-col gap-1.5 rounded-2xl p-3.5"
                    style={{
                      background: "color-mix(in srgb, var(--color-surface-card) 80%, transparent)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid color-mix(in srgb, var(--color-border-amber) 28%, var(--color-border-light))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                  >
                    <span className="text-[22px] leading-none">{f.icon}</span>
                    <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>{f.title}</p>
                    <p className="text-[11px] leading-snug" style={{ color: "var(--color-text-muted)" }}>{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Hero image ── */}
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto hidden w-full max-w-sm lg:block lg:max-w-none lg:mt-12"
          >
            <div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--color-amber-primary) 18%, transparent), transparent 70%)",
                opacity: 0.7,
              }}
              aria-hidden="true"
            />

            <div
              className="glass-card relative overflow-hidden rounded-[2rem] border p-2"
              style={{
                borderColor: "var(--color-border-light)",
                boxShadow: "var(--shadow-elevated)",
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/assets/vikingos-cerveza.jpg"
                  alt="Cerveceros disfrutando cerveza artesanal"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 38vw"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-surface-overlay) 88%, transparent) 100%)",
                  }}
                />
                <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
                  <span
                    className="glass-pill rounded-full px-3 py-2 text-[14px] font-semibold leading-snug"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Encontré mi cerveza favorita en 5 minutos. Esta comunidad es otro nivel 🍺
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
