"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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
    tag: "La comunidad cervecera #1 de Chile",
    title: "Tu pasaporte al mundo de la",
    highlight: "cerveza artesanal",
    description:
      "Descubre cervezas únicas, encuentra bares escondidos y conecta con una comunidad apasionada. El Airbnb de la cerveza artesanal.",
    image: "/assets/personajes/lupinvikingoylupincervesota.png",
    cta: { label: "Comenzar gratis", href: "/auth/register" },
    accent: "rgba(251,191,36,0.35)",
    glowPosition: "30% 40%",
  },
  {
    tag: "Catálogo colaborativo",
    title: "Explora cientos de",
    highlight: "cervezas artesanales",
    description:
      "Reseñas detalladas, puntuaciones de la comunidad y notas de cata. Cada cerveza tiene su historia — descubre la próxima que vas a amar.",
    image: "/assets/personajes-landing/explorar-cervezas.png",
    cta: { label: "Ver cervezas", href: "/cervezas" },
    accent: "rgba(245,158,11,0.35)",
    glowPosition: "70% 30%",
  },
  {
    tag: "Mapa cervecero",
    title: "Encuentra los mejores",
    highlight: "bares y brewpubs",
    description:
      "Desde bares ocultos hasta beer gardens al aire libre. Descubre dónde disfrutar cerveza artesanal cerca de ti.",
    image: "/assets/personajes-landing/encuentra-bares.png",
    cta: { label: "Explorar lugares", href: "/lugares" },
    accent: "rgba(239,68,68,0.3)",
    glowPosition: "25% 60%",
  },
  {
    tag: "Comunidad activa",
    title: "Únete a la tribu de",
    highlight: "cerveceros apasionados",
    description:
      "Publica descubrimientos, comparte fotos, comenta reseñas y conecta con miles de amantes del lúpulo.",
    image: "/assets/personajes-landing/comparte-comunidades.png",
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

const textVariants: Variants = {
  enter: { opacity: 0, y: 30 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const childVariants: Variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const imageVariants: Variants = {
  enter: { opacity: 0, scale: 0.9, x: 60 },
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, x: -40, transition: { duration: 0.3 } },
};

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
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
        setCurrent((prev) => (prev + 1) % slides.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [current, isPaused]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setProgress(0);
  }, []);

  const slide = slides[current];

  return (
    <section
      className="relative flex min-h-[calc(100vh-64px)] items-start overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Background ─── */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Accent glow (changes per slide) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute h-[500px] w-[500px] rounded-full blur-[120px]"
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

      {/* ─── Slide Content ─── */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-20 lg:flex-row lg:items-center lg:gap-12 lg:pt-24 lg:text-left"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* Text side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-1 flex-col"
          >
            <motion.span
              variants={childVariants}
              className="border-amber-primary/30 bg-amber-primary/10 text-amber-primary mb-3 inline-block self-center rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide uppercase lg:self-start"
            >
              {slide.tag}
            </motion.span>

            <motion.h1
              variants={childVariants}
              className="text-text-primary mt-3 text-3xl leading-[1.15] font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]"
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
              <Link
                href={slide.cta.href}
                prefetch
                className="group hover:shadow-amber-primary/25 relative overflow-hidden rounded-full px-8 py-4 text-center text-sm font-bold shadow-xl transition-all duration-300"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                }}
              >
                <span className="relative z-10">{slide.cta.label}</span>
                <div className="from-amber-light to-amber-muted absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <Link
                href="/cervezas"
                prefetch
                className="border-border-medium bg-border-subtle text-text-primary hover:border-border-amber hover:bg-border-light rounded-full border px-8 py-4 text-center text-sm font-medium backdrop-blur-sm transition-all duration-300"
              >
                Explorar cervezas
              </Link>
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
                  {["ragnar", "Lagertha", "bjorn", "Kwenthrith"].map((name) => (
                    <Image
                      key={name}
                      src={`/assets/avatars/${name}.png`}
                      alt={name}
                      width={32}
                      height={32}
                      className="border-amber-dark rounded-full border-2"
                      style={{ width: 32, height: 32, objectFit: "cover" }}
                    />
                  ))}
                </div>
                <p className="text-text-muted text-sm">
                  <span className="text-amber-primary font-semibold">2,500+</span> cerveceros ya
                  exploran
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Image side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${current}`}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="mt-8 flex flex-1 items-center justify-center lg:mt-0"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={slide.image}
                alt={slide.highlight}
                width={600}
                height={500}
                priority={current === 0}
                unoptimized
                className="drop-shadow-2xl"
                style={{
                  width: "100%",
                  maxWidth: 500,
                  height: "auto",
                  filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.4))",
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Navigation: Dots + Progress ─── */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
        {/* Dots */}
        <div className="flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative flex h-8 w-8 items-center justify-center"
              aria-label={`Ir a slide ${i + 1}`}
            >
              {/* Background ring on active */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: i === current ? 1 : 0,
                  opacity: i === current ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                style={{ border: "1.5px solid var(--color-border-amber)" }}
              />
              {/* Dot */}
              <motion.div
                className="rounded-full transition-colors"
                animate={{
                  width: i === current ? 10 : 6,
                  height: i === current ? 10 : 6,
                  backgroundColor:
                    i === current ? "var(--color-amber-primary)" : "var(--color-text-ghost)",
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-border-subtle h-0.5 w-32 overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "var(--gradient-button-primary)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
