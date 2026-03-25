"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, staggerContainer, popIn } from "./shared";
import { FEATURES } from "./data";

/* ═══════════════════════════════════
   Live Activity Feed — simulated real-time
   ═══════════════════════════════════ */

const ACTIVITIES = [
  { user: "🍺 Matías", action: "le dio 4.8★ a", target: "Kross Lupulada Session IPA", time: "hace 1 min", emoji: "⭐" },
  { user: "🏭 Cervecería Nómade", action: "lanzó en exclusiva:", target: "Neblina Hazy — lote de 500 botellas", time: "hace 4 min", emoji: "🆕" },
  { user: "💬 Camila", action: "encendió el debate:", target: "¿West Coast o Hazy? La guerra eterna", time: "hace 7 min", emoji: "🔥" },
  { user: "📍 Felipe", action: "puso en el mapa:", target: "Cervecería La Quimera — Barrio Yungay", time: "hace 11 min", emoji: "📍" },
  { user: "🍻 Sofía", action: "compartió galería:", target: "Noche de Stouts en Barrio Italia (12 fotos)", time: "hace 14 min", emoji: "📸" },
  { user: "🏆 Diego", action: "entró al top 5 de", target: "Mejores IPAs del mes — voto popular", time: "hace 17 min", emoji: "🏆" },
  { user: "⚡ Martina", action: "se conectó con", target: "Cervecería Atrapaniebla para colaborar", time: "hace 21 min", emoji: "🤝" },
  { user: "🧠 Lúpulos IA", action: "descubrió para ti:", target: "3 Pale Ales con cítrico que vas a amar", time: "hace 24 min", emoji: "🧠" },
];

function LiveActivityFeed() {
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIdx((i) => (i + 1) % ACTIVITIES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const current = ACTIVITIES[visibleIdx];

  return (
    <div className="relative h-14 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={visibleIdx}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center gap-3 rounded-xl border px-4 py-2"
          style={{
            background: "var(--color-surface-card-alt)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <motion.span
            className="text-lg"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {current.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary truncate text-sm font-semibold">
              <span style={{ color: "var(--color-amber-primary)" }}>{current.user}</span>{" "}
              <span className="text-text-secondary font-normal">{current.action}</span>{" "}
              {current.target}
            </p>
            <p className="text-text-muted text-[11px]">{current.time}</p>
          </div>
          <motion.div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: "var(--color-emerald)" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════
   Testimonial Marquee
   ═══════════════════════════════════ */

const TESTIMONIALS = [
  { text: "Busqué 'cervecería cerca' y Google me tiró cadenas. Acá encontré un taproom a 3 cuadras con una IPA que me voló la cabeza. Llevo 4 meses yendo cada viernes.", user: "Joaquín R.", role: "Cervecero de corazón · Santiago" },
  { text: "La IA me sugirió una Baltic Porter que jamás habría elegido. Ahora es mi cerveza de cabecera y ya llevo 6 amigos convertidos.", user: "Valentina M.", role: "Exploradora incansable · Valparaíso" },
  { text: "Subimos nuestra primera cerveza un lunes. El viernes teníamos 200+ reseñas y pedidos de 3 distribuidores. No existe nada así en Chile.", user: "Cervecería Magallanes", role: "Productores artesanales · Punta Arenas" },
  { text: "Acá los rankings son de verdad. Cero pago por posición, cero algoritmo raro. La comunidad vota y punto. Como debería ser siempre.", user: "Andrés C.", role: "Juez certificado BJCP · Concepción" },
  { text: "Vine por las cervezas y me quedé por la gente. En 6 meses hice amigos reales en catas que encontré acá. Es mucho más que una app.", user: "Francisca L.", role: "Miembro activa · Viña del Mar" },
];

function TestimonialMarquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div
      className="relative py-6 sm:py-8"
      style={{
        overflowX: "clip",
        overflowY: "visible",
        maskImage: "linear-gradient(to bottom, black 85%, transparent), linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent), linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
      }}
    >

      <motion.div
        className="flex gap-4 px-6 sm:px-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="glass-card group relative w-[400px] shrink-0 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, s) => (
                <motion.span
                  key={s}
                  className="text-xs"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: s * 0.08 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed italic">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                }}
              >
                {t.user[0]}
              </div>
              <div>
                <p className="text-text-primary text-xs font-bold">{t.user}</p>
                <p className="text-text-muted text-[10px]">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

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
   Floating Hops (decorative)
   ═══════════════════════════════════ */

const HOPS = ["🌿", "🍃", "✨", "🫧", "🌾"];

function FloatingHops() {
  return (
    <>
      {HOPS.map((hop, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-lg select-none"
          style={{
            left: `${10 + i * 20}%`,
            top: `${15 + (i % 3) * 30}%`,
            opacity: 0.12,
            fontSize: `${18 + i * 4}px`,
          }}
          animate={{
            y: [0, -20 - i * 5, 0],
            x: [0, 8 + i * 2, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 5 + i * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          aria-hidden="true"
        >
          {hop}
        </motion.span>
      ))}
    </>
  );
}

/* ═══════════════════════════════════
   Community Counter
   ═══════════════════════════════════ */

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════
   Main Component
   ═══════════════════════════════════ */

export default function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useTransform(mouseX, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [0, 1], ["20%", "80%"]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    const el = sectionRef.current;
    el?.addEventListener("mousemove", handleMouse);
    return () => el?.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-20 pb-28 sm:pt-24 sm:pb-36"
      style={{
        background:
          "linear-gradient(180deg, var(--color-surface-overlay) 0%, var(--color-surface-deepest) 30%, var(--color-surface-dark) 60%, var(--color-surface-overlay) 100%)",
      }}
      aria-label="Comunidad"
    >
      {/* ── Interactive mouse-following glow ── */}
      <motion.div
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full blur-[150px]"
        style={{
          background: "color-mix(in srgb, var(--color-amber-primary) 6%, transparent)",
          left: glowX,
          top: glowY,
          x: "-50%",
          y: "-50%",
        }}
        aria-hidden="true"
      />

      {/* ── Ambient corner glows ── */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full blur-[140px]"
        style={{ background: "color-mix(in srgb, var(--color-amber-primary) 5%, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full blur-[140px]"
        style={{ background: "color-mix(in srgb, var(--color-emerald) 4%, transparent)" }}
        aria-hidden="true"
      />

      {/* ── Floating decorative hops ── */}
      <FloatingHops />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* ═══ Hero row: heading ═══ */}
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-end lg:gap-16">

          {/* Text + live feed */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <SectionBadge>Pasa ahora. Pasa aquí. Pasa en Lúpulos</SectionBadge>

            <h2 className="text-text-primary mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Donde la cerveza artesanal{" "}
              <GradientText>cobra vida</GradientText>
            </h2>

            <p className="text-text-secondary mt-5 max-w-lg text-base font-semibold leading-relaxed sm:text-lg">
              Esto no es un catálogo más. Es el lugar donde 8.500 cerveceros descubren, debaten, crean y comparten. Con IA que evoluciona contigo, un mapa que Google envidia y rankings donde manda tu voto — no un algoritmo.
            </p>

            {/* ── Counters row ── */}
            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: "🍺", value: 1200, suffix: "+", label: "Cervezas" },
                { icon: "👥", value: 8500, suffix: "+", label: "Miembros" },
                { icon: "⭐", value: 42000, suffix: "+", label: "Reseñas" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={popIn}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span className="text-lg">{stat.icon}</span>
                  <span
                    className="text-xl font-black"
                    style={{ color: "var(--color-amber-primary)" }}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-text-muted text-[11px] font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Live activity feed ── */}
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2">
                <motion.div
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--color-emerald)" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-text-muted text-[11px] font-semibold uppercase tracking-wider">
                  Actividad en vivo
                </span>
              </div>
              <LiveActivityFeed />
            </div>
          </motion.div>
        </div>

        {/* ═══ Feature Cards — 3D glass grid ═══ */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.label}
              variants={popIn}
              whileHover={{
                y: -6,
                scale: 1.04,
                rotateX: 3,
                rotateY: i % 2 === 0 ? 2 : -2,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="glass-card group relative flex items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4"
              style={{
                perspective: "800px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Left accent bar on hover */}
              <div
                className="absolute left-0 top-0 h-full w-1 scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                style={{ background: "var(--gradient-button-primary)", transformOrigin: "top" }}
              />
              {/* Hover glow overlay */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 30% 50%, color-mix(in srgb, var(--color-amber-primary) 6%, transparent), transparent 70%)",
                }}
              />
              <motion.span
                className="relative z-10 shrink-0 text-2xl leading-none"
                aria-hidden="true"
                whileHover={{ scale: 1.35, rotate: 20 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {feat.icon}
              </motion.span>
              <span className="text-text-secondary group-hover:text-text-primary relative z-10 text-base font-bold transition-colors duration-200">
                {feat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ Testimonials marquee ═══ */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 text-center">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-[0.2em]">
              Lo que dicen quienes ya están dentro
            </span>
          </div>
          <TestimonialMarquee />
        </motion.div>

        {/* ═══ Newsletter + CTA ═══ */}
        <motion.div
          className="mt-20 text-center"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-text-primary text-2xl font-black sm:text-3xl">
            El correo que los cerveceros sí abren <span className="inline-block">🍻</span>
          </h3>
          <p className="text-text-secondary mt-3 text-base font-semibold sm:text-lg">
            Cada martes: lanzamientos exclusivos, hallazgos de la comunidad y la cerveza que no sabías que necesitabas.
          </p>

          <div className="mt-6">
            <MagicNewsletterForm />
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/auth/register"
                prefetch
                className="group relative inline-block overflow-hidden rounded-full px-9 py-4 text-sm font-bold transition-all duration-300 hover:shadow-xl hover:brightness-110"
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

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/cervezas"
                prefetch
                className="inline-block rounded-full border px-9 py-4 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:brightness-110"
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
