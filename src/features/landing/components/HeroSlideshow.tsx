"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import ScrollIndicator from "./ScrollIndicator";
import CommunityAnimation from "./CommunityAnimation";
import HeroCharacterIllustration from "./HeroCharacterIllustration";
import { ExploreCervezasIllustration, EncuentraBaresIllustration } from "./StoryIllustrations";

/* ═══════════════════════════════════
   Slide Data
   ═══════════════════════════════════ */

interface Slide {
  tag: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  cta: { label: string; href: string };
  accent: string; // glow color
  glowPosition: string; // CSS position for the accent glow
}

const slides: Slide[] = [
  {
    tag: "+8.500 cerveceros ya están dentro 🇨🇱",
    title: "Tu próxima cerveza favorita está aquí. Solo falta que la",
    highlight: "descubras",
    description:
      "El catálogo más completo de cerveza artesanal en Chile, con opiniones reales, cervecerías que no vas a encontrar en Google y una IA que aprende lo que le gusta a tu paladar.",
    image: "__hero_illustration__",
    cta: { label: "Empezar gratis", href: "/auth/register" },
    accent: "rgba(251,191,36,0.35)",
    glowPosition: "30% 40%",
  },
  {
    tag: "🍺 +1.200 cervezas artesanales chilenas",
    title: "Notas de cata, aromas, maridajes — cada cerveza tiene su",
    highlight: "ficha completa",
    description:
      "Opiniones de gente real, no de bots. Puntuaciones de la comunidad. Si fabricas, tu cerveza tiene vitrina propia. Si buscas, tu próxima obsesión está a un scroll.",
    image: "__explorar_cervezas__",
    cta: { label: "Explorar cervezas", href: "/cervezas" },
    accent: "rgba(245,158,11,0.35)",
    glowPosition: "70% 30%",
  },
  {
    tag: "📍 280+ cervecerías verificadas por la comunidad",
    title: "Los lugares que los cerveceros recomiendan, en un",
    highlight: "mapa vivo",
    description:
      "Taprooms con lotes experimentales que nunca llegan a botillería. Brewpubs de barrio con recetas de tres generaciones. Los rincones con alma que Google no conoce.",
    image: "__encuentra_bares__",
    cta: { label: "Abrir el mapa", href: "/lugares" },
    accent: "rgba(239,68,68,0.3)",
    glowPosition: "25% 60%",
  },
  {
    tag: "⚡ La comunidad cervecera más activa de Chile",
    title: "El lugar donde fans y cerveceros comparten la",
    highlight: "misma mesa",
    description:
      "Descubrimientos que te cambian el fin de semana. Debates sobre estilos que no terminan. Cerveceros mostrando lo que acaban de sacar del fermentador. Esto es comunidad real.",
    image: "__community_animation__",
    cta: { label: "Unirme ahora", href: "/auth/register" },
    accent: "rgba(52,211,153,0.3)",
    glowPosition: "65% 50%",
  },
];

const SLIDE_DURATION = 6000; // ms per slide

/* ═══════════════════════════════════
   Color helpers
   ═══════════════════════════════════ */

function rgbaWithAlpha(input: string, alpha: number) {
  const m = input.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)$/);
  if (!m) return input;
  return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
}

/* ═══════════════════════════════════
   Bubbles (shared background effect)
   ═══════════════════════════════════ */

interface Bubble {
  id: number;
  size: number;
  left: string;
  duration: number;
  delay: number;
  opacity: number;
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 10,
    left: `${(Math.random() * 100).toFixed(1)}%`,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.26,
  }));
}

/* ═══════════════════════════════════
   Animation Variants
   ═══════════════════════════════════ */

const childVariants: Variants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* 3D carousel: the active slide rotates in/out on the Y axis */
const slide3DVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? 38 : -38,
    scale: 0.88,
  }),
  center: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.09,
      delayChildren: 0.18,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? -38 : 38,
    scale: 0.88,
    transition: { duration: 0.38, ease: [0.55, 0, 1, 0.45] },
  }),
};

/* ═══════════════════════════════════
   Circular Carousel Navigation
   ═══════════════════════════════════ */

function CircularCarouselNav({
  current,
  progress,
  goTo,
}: {
  current: number;
  progress: number;
  goTo: (i: number) => void;
}) {
  const N = slides.length;
  const cx = 60, cy = 60, r = 40;
  const gap = 16;
  const span = 360 / N - gap; // 74° per arc
  const toRad = (d: number) => (d * Math.PI) / 180;

  const segments = Array.from({ length: N }, (_, i) => {
    const start = -90 + i * (360 / N) + gap / 2;
    const end = start + span;
    const mid = (start + end) / 2;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = span > 180 ? 1 : 0;
    const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    const dotX = cx + r * Math.cos(toRad(mid));
    const dotY = cy + r * Math.sin(toRad(mid));
    return { d, dotX, dotY };
  });

  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="arc-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {segments.map((seg, i) => (
        <g
          key={i}
          onClick={() => goTo(i)}
          style={{ cursor: "pointer" }}
          role="button"
          aria-label={`Ir a slide ${i + 1}`}
        >
          {/* Wide transparent hit area */}
          <path d={seg.d} fill="none" stroke="transparent" strokeWidth={22} />

          {/* Background arc */}
          <path
            d={seg.d}
            fill="none"
            stroke={
              i === current
                ? "rgba(251,191,36,0.22)"
                : "rgba(255,255,255,0.1)"
            }
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Active arc progress fill */}
          {i === current && (
            <motion.path
              key={`arc-${current}`}
              d={seg.d}
              fill="none"
              stroke="var(--color-amber-primary)"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ filter: "url(#arc-glow)" }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: progress / 100, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.06, ease: "linear" },
                opacity: { duration: 0.3 },
              }}
            />
          )}

          {/* Dot at midpoint — lights up on active */}
          <motion.circle
            cx={seg.dotX}
            cy={seg.dotY}
            animate={{
              r: i === current ? 4 : 2.5,
              fill:
                i === current
                  ? "var(--color-amber-primary)"
                  : "rgba(255,255,255,0.25)",
            }}
            style={i === current ? { filter: "url(#arc-glow)" } : {}}
            transition={{ duration: 0.35 }}
          />
        </g>
      ))}

      {/* Center: slide counter */}
      <text
        x="60"
        y="57"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="var(--color-amber-primary)"
        style={{ fontFamily: "var(--font-heading, sans-serif)" }}
      >
        {current + 1}
      </text>
      <text x="60" y="68" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">
        / {N}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const bubbles = useMemo(() => generateBubbles(20), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ─── Auto-advance with progress ─── */
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // progress tick ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / SLIDE_DURATION) * 100);

      if (elapsed >= SLIDE_DURATION) {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [current, isPaused]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
      setProgress(0);
    },
    [current],
  );

  const slide = slides[current];

  return (
    <section
      className="relative flex min-h-[min(78vh,700px)] items-start"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Background ─── */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--color-amber-primary) 4%, transparent) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      {/* Accent glow (changes per slide) — bigger + more vibrant */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${slide.accent}, transparent 70%)`,
            top: slide.glowPosition.split(" ")[1],
            left: slide.glowPosition.split(" ")[0],
            transform: "translate(-50%, -50%)",
          }}
        />
      </AnimatePresence>

      {/* Bubbles */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute rounded-full"
              style={{
                width: b.size,
                height: b.size,
                left: b.left,
                bottom: -10,
                background: `radial-gradient(circle, ${rgbaWithAlpha(slide.accent, b.opacity)}, transparent)`,
              }}
              animate={{ y: [0, -800], opacity: [0, 1, 0] }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                delay: b.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Slide Content: 3D perspective carousel ─── */}
      <div
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-4 pb-32 sm:pt-6 lg:pt-8"
        style={{ perspective: "1100px" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`slide-${current}`}
            custom={direction}
            variants={slide3DVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-10 lg:text-left"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Text side */}
            <div className="flex flex-1 flex-col">
              <motion.span
                variants={childVariants}
                className="border-amber-primary/30 bg-amber-primary/10 text-amber-primary mb-3 inline-block self-center rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide uppercase lg:self-start"
              >
                {slide.tag}
              </motion.span>

              <motion.h1
                variants={childVariants}
                className="text-text-primary mt-3 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[3.75rem]"
              >
                {slide.title}{" "}
                <span className="from-amber-primary via-amber-light to-orange-cta bg-gradient-to-r bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </motion.h1>

              <motion.p
                variants={childVariants}
                className="text-text-secondary mt-4 max-w-xl text-base leading-relaxed lg:text-lg"
              >
                {slide.description}
              </motion.p>

              <motion.div
                variants={childVariants}
                className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={slide.cta.href}
                    prefetch
                    className="group hover:shadow-amber-primary/25 relative overflow-hidden rounded-full px-9 py-4 text-center text-sm font-bold shadow-xl transition-all duration-300"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                      boxShadow: "var(--shadow-amber-glow)",
                    }}
                  >
                    <span className="relative z-10">{slide.cta.label}</span>
                    {/* Shimmer sweep */}
                    <span
                      className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-600 group-hover:translate-x-full"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                    />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/cervezas"
                    prefetch
                    className="border-border-medium bg-border-subtle text-text-primary hover:border-border-amber hover:bg-border-light rounded-full border px-9 py-4 text-center text-sm font-medium backdrop-blur-sm transition-all duration-300"
                  >
                    Ver catálogo
                  </Link>
                </motion.div>
              </motion.div>

              {/* Social proof (only on first slide) */}
              {current === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-6 flex items-center justify-center gap-3 lg:justify-start"
                >
                  <div className="flex -space-x-2">
                    {["ragnar", "Lagertha", "bjorn", "Kwenthrith"].map((name, idx) => (
                      <motion.div
                        key={name}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1, type: "spring", stiffness: 400, damping: 15 }}
                        whileHover={{ scale: 1.2, y: -4, zIndex: 10 }}
                      >
                        <Image
                          src={`/assets/avatars/${name}.png`}
                          alt={name}
                          width={32}
                          height={32}
                          className="border-amber-dark rounded-full border-2"
                          style={{ width: 32, height: 32, objectFit: "cover" }}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-text-muted text-sm">
                    <span className="text-amber-primary font-semibold">8.500+</span> cerveceros ya
                    están dentro
                  </p>
                </motion.div>
              )}
            </div>

            {/* Image side */}
            <motion.div
              variants={childVariants}
              className="mt-8 flex flex-1 items-center justify-center lg:mt-0"
            >
              {slide.image === "__community_animation__" ? (
                <CommunityAnimation />
              ) : slide.image === "__hero_illustration__" ? (
                <HeroCharacterIllustration />
              ) : slide.image === "__explorar_cervezas__" ? (
                <ExploreCervezasIllustration />
              ) : slide.image === "__encuentra_bares__" ? (
                <EncuentraBaresIllustration />
              ) : (
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.highlight}
                    width={420}
                    height={350}
                    priority={current === 0}
                    unoptimized
                    className="drop-shadow-2xl"
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      height: "auto",
                      filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Scroll Indicator ─── */}
      <ScrollIndicator />

      {/* ─── Navigation: Circular Arc Carousel ─── */}
      <div className="absolute bottom-[76px] left-1/2 z-20 -translate-x-1/2">
        <CircularCarouselNav current={current} progress={progress} goTo={goTo} />
      </div>
    </section>
  );
}
