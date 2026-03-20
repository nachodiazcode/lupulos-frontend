"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useSpring, AnimatePresence } from "framer-motion";
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
  { icon: "🍺", value: "1.200+", label: "cervezas" },
  { icon: "📍", value: "280+",   label: "lugares" },
  { icon: "💬", value: "42K+",   label: "reseñas" },
];

const floatingPills = [
  { icon: "🍺", label: "1.200+ cervezas", pos: { top: "8%",    left: "-10%"  }, delay: 0,   dur: 4.2 },
  { icon: "⭐", label: "4.8 / 5 rating",  pos: { top: "22%",   right: "-11%" }, delay: 0.9, dur: 5.1 },
  { icon: "📍", label: "280+ lugares",    pos: { bottom: "20%",left: "-12%"  }, delay: 1.6, dur: 4.7 },
] as const;

/* ═══════════════════════════════════
   Word Cycler
   ═══════════════════════════════════ */

const CYCLING_WORDS = [
  "artesanal,", "craft,", "lúpulo,", "IPA,", "Stout,", "local 🇨🇱",
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
   3-D Orbit Image
   ═══════════════════════════════════ */

function OrbitImage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(wrapperRef, { amount: 0.4 });
  const [spinKey, setSpinKey] = useState(0);
  const prevInView = useRef(false);

  /* Re-trigger spin each time the element enters the viewport */
  useEffect(() => {
    if (isInView && !prevInView.current) {
      setSpinKey((k) => k + 1);
    }
    prevInView.current = isInView;
  }, [isInView]);

  /* Mouse parallax — spring suave */
  const cfg   = { stiffness: 55, damping: 18 };
  const prlxX = useSpring(0, cfg);
  const prlxY = useSpring(0, cfg);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      prlxX.set((e.clientX / window.innerWidth  - 0.5) * 24);
      prlxY.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [prlxX, prlxY]);

  return (
    <motion.div
      ref={wrapperRef}
      className="relative flex flex-1 items-center justify-center"
      style={{ perspective: "1000px", minHeight: 420 }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Warm glow disc ── */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 320, height: 320,
          background:
            "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(251,191,36,0.12) 50%, transparent 75%)",
          filter: "blur(36px)",
        }}
      />

      {/* ── Orbit ring 1 — outer, tilted 72° ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 380, height: 380,
          transform: "rotateX(72deg)",
          transformStyle: "preserve-3d",
          borderRadius: "50%",
        }}
      >
        <motion.div
          style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            border: "1.5px solid rgba(249,115,22,0.35)",
            position: "relative",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          {/* Travelling dot */}
          <span
            style={{
              position: "absolute",
              width: 10, height: 10,
              background: "#f97316",
              borderRadius: "50%",
              top: -5, left: "calc(50% - 5px)",
              boxShadow: "0 0 16px rgba(249,115,22,0.9), 0 0 6px #f97316",
            }}
          />
        </motion.div>
      </div>

      {/* ── Orbit ring 2 — inner, tilted + offset 55° ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 300, height: 300,
          transform: "rotateX(72deg) rotateZ(55deg)",
          transformStyle: "preserve-3d",
          borderRadius: "50%",
        }}
      >
        <motion.div
          style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            border: "1px dashed rgba(251,191,36,0.32)",
            position: "relative",
          }}
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <span
            style={{
              position: "absolute",
              width: 7, height: 7,
              background: "#fbbf24",
              borderRadius: "50%",
              top: -3.5, left: "calc(50% - 3.5px)",
              boxShadow: "0 0 10px rgba(251,191,36,0.95)",
            }}
          />
        </motion.div>
      </div>

      {/* ── Character — parallax mouse + 3-D spin on viewport entry ── */}
      <motion.div className="relative z-10" style={{ x: prlxX, y: prlxY }}>
        <motion.div
          key={`orbit-spin-${spinKey}`}
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: -720, opacity: 0, scale: 0.7 }}
          animate={{ rotateY: 0,    opacity: 1, scale: 1   }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Float suave encima del spin */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/personajes/lupinvikingoylupincervesota.png"
              alt="Personajes Lúpulos"
              width={420}
              height={360}
              priority
              unoptimized
              style={{
                width: "100%",
                maxWidth: 360,
                height: "auto",
                filter: "drop-shadow(0 18px 44px rgba(180,80,0,0.22))",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Floating info pills (desktop only) ── */}
      {floatingPills.map((pill) => (
        <motion.div
          key={pill.label}
          className="glass-pill absolute z-20 hidden items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold lg:flex"
          style={{
            ...pill.pos,
            color: "var(--color-text-secondary)",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: pill.dur, repeat: Infinity, delay: pill.delay, ease: "easeInOut" }}
        >
          <span className="text-sm">{pill.icon}</span>
          <span>{pill.label}</span>
        </motion.div>
      ))}
    </motion.div>
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
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">

          {/* ── LEFT: Text ── */}
          <div className="flex flex-1 flex-col">

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
              Plataforma #1 de cerveza artesanal en Chile 🇨🇱
            </motion.span>

            {/* H1 */}
            <motion.h1
              className="text-text-primary text-3xl leading-[1.05] font-black tracking-tighter sm:text-4xl md:text-[3rem] lg:text-[3.4rem]"
              style={{ textShadow: "0.6px 0.6px 0 currentColor, -0.6px 0 0 currentColor, 0 0.6px 0 currentColor, 0 -0.6px 0 currentColor" }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Todo sobre<br />
              cerveza{" "}<WordCycler /><br />
              en un lugar.
            </motion.h1>
            {/* Subtitle */}
            <motion.p
              className="text-text-secondary mt-3 max-w-lg text-base font-semibold leading-relaxed lg:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
            >
              Catálogo curado, cervecerías con alma y una comunidad que vive por el lúpulo.
              Tu próxima favorita está a un click de distancia.
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
                  <span className="relative z-10">Entrar al mundo Lúpulos</span>
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
                  Explorar cervezas
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
                <span style={{ color: "var(--color-amber-primary)", fontWeight: 600 }}>2.500+</span> cerveceros ya exploran
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

          {/* ── RIGHT: 3-D Orbit Image ── */}
          <OrbitImage />

        </div>

        {/* ── Cool gradient line ── */}
        <motion.div
          className="mx-auto mt-6 mb-3 h-px w-full max-w-md"
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
