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

const avatarNames = ["ragnar", "Lagertha", "bjorn", "Kwenthrith"] as const;

const statChips = [
  { icon: "🍺", value: "1.200+", label: "cervezas con ficha" },
  { icon: "📍", value: "280+",   label: "cervecerías activas" },
  { icon: "💬", value: "42K+",   label: "reseñas reales" },
];

/* ═══════════════════════════════════
   Word Cycler
   ═══════════════════════════════════ */

const CYCLING_WORDS = [
  "artesanal,", "que amaste,", "con historia,", "imposible,", "perfecta,", "chilena 🇨🇱",
] as const;

function WordCycler() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = CYCLING_WORDS[wordIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setWordIdx((i) => (i + 1) % CYCLING_WORDS.length);
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
    <span className="relative inline-block" aria-live="polite">
      <span
        className="font-black"
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
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-end lg:gap-16 lg:text-left">

          {/* ── RIGHT: Text ── */}
          <div className="flex w-full flex-col lg:max-w-2xl">

            {/* Badge */}
            <motion.span
              className="mb-5 inline-block self-center rounded-full border px-5 py-2 text-sm font-medium tracking-wide uppercase lg:self-start"
              style={{
                borderColor: "var(--color-border-amber)",
                background: "rgba(249,115,22,0.1)",
                color: "var(--color-amber-primary)",
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              La comunidad craft más grande de Chile 🇨🇱
            </motion.span>

            {/* H1 */}
            <motion.h1
              className="text-text-primary text-3xl leading-[1.05] font-black tracking-tighter sm:text-4xl md:text-[3rem] lg:text-[3.4rem]"
              style={{ textShadow: "0.6px 0.6px 0 currentColor, -0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0 -0.6px 0 currentColor" }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Tu próxima cerveza<br />
              <WordCycler /><br />
              te espera aquí.
            </motion.h1>
            {/* Subtitle */}
            <motion.p
              className="text-text-secondary mt-3 max-w-lg text-base font-semibold leading-relaxed lg:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
            >
              1.200 cervezas artesanales. 280 cervecerías con alma. Una IA que aprende tu paladar con cada sorbo. Y una comunidad de 8.500 cerveceros que ya cambiaron la forma de vivir la cerveza craft en Chile.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/auth/register"
                  prefetch
                  className="group relative overflow-hidden rounded-full px-10 py-4 text-center text-base font-bold shadow-xl transition-all duration-300"
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

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/cervezas"
                  prefetch
                  className="rounded-full border px-10 py-4 text-center text-base font-medium transition-all duration-300"
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

            {/* Social proof: avatars */}
            <motion.div
              className="mt-6 flex items-center justify-center gap-3 lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62, duration: 0.6 }}
            >
              <div className="flex -space-x-2">
                {avatarNames.map((name, idx) => (
                  <motion.div
                    key={name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.68 + idx * 0.08, type: "spring", stiffness: 400, damping: 15 }}
                    whileHover={{ scale: 1.2, y: -4, zIndex: 10 }}
                  >
                    <Image
                      src={`/assets/avatars/${name}.png`}
                      alt={name}
                      width={32}
                      height={32}
                      className="rounded-full border-2"
                      style={{ width: 32, height: 32, objectFit: "cover", borderColor: "#f97316" }}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-amber-primary)", fontWeight: 600 }}>8.500+</span> se unieron este mes
              </p>
            </motion.div>

            {/* Stat chips */}
            <motion.div
              className="mt-5 flex flex-wrap justify-center gap-2.5 lg:justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.76, duration: 0.5 }}
            >
              {statChips.map((chip) => (
                <div
                  key={chip.label}
                  className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span>{chip.icon}</span>
                  <span style={{ color: "var(--color-amber-primary)", fontWeight: 700 }}>{chip.value}</span>
                  <span>{chip.label}</span>
                </div>
              ))}
            </motion.div>

          </div>

        </div>

        {/* ── Cool gradient line ── */}
        <motion.div
          className="mx-auto mt-5 mb-3 h-px w-full max-w-md"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.35), rgba(251,191,36,0.25), rgba(249,115,22,0.35), transparent)",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.82, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* AI Prompt Bar — centered */}
        <motion.div
          className="mx-auto w-full max-w-3xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88, duration: 0.55 }}
        >
          <AiPromptBar />
        </motion.div>
      </div>
    </section>
  );
}
