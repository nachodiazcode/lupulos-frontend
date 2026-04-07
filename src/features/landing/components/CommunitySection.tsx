"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, staggerContainer } from "./shared";
import { FEATURES } from "./data";

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
      className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28 lg:pb-36"
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

      <div className="home-content-shell relative z-10">
        {/* ═══ Hero row: heading ═══ */}
        <div className="flex flex-col items-center justify-center">

          {/* Text + live feed */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto w-full max-w-[52rem] text-center"
          >
            <SectionBadge>Bienvenido a la tierra del lúpulo</SectionBadge>

            <h2 className="text-text-primary mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              La comunidad que vive
              <span className="block">
                <GradientText>y respira cerveza artesanal</GradientText>
              </span>
            </h2>

            <p
              className="mx-auto mt-5 max-w-[44rem] text-base font-semibold leading-relaxed sm:text-lg"
              style={{ color: "color-mix(in srgb, var(--color-text-primary) 78%, var(--color-text-secondary) 22%)" }}
            >
              El lugar donde la comunidad vikinga escribe sus aventuras y Odín disfruta descubriendo brebajes jamás explorados. ¿Estás listo, guerrero?{" "}
              <span
                className="font-black"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-amber-primary), var(--color-orange-cta), #fbbf24, #c084fc, var(--color-amber-primary))",
                  backgroundSize: "240% 240%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "magic-gradient-shift 6s ease-in-out infinite",
                  filter: "drop-shadow(0 0 10px color-mix(in srgb, var(--color-amber-primary) 18%, transparent))",
                }}
              >
                ¡Skål!
              </span>
            </p>

          </motion.div>
        </div>

        {/* ═══ Desktop: Infinite Carousel ═══ */}
        <div className="relative mx-auto mt-6 hidden w-full max-w-6xl overflow-hidden sm:mt-8 sm:block lg:mt-8">
          {/* Gradient fade edges */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32"
            style={{
              background: "linear-gradient(90deg, var(--color-surface-deepest) 0%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32"
            style={{
              background: "linear-gradient(270deg, var(--color-surface-deepest) 0%, transparent 100%)",
            }}
          />

          {/* Infinite scrolling track */}
          <div className="marquee-track flex gap-3">
            {[...FEATURES, ...FEATURES].map((feat, i) => (
              <motion.div
                key={`${feat.label}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                  scale: 1.05,
                  rotateY: 5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card group relative flex min-h-[5rem] w-[300px] shrink-0 items-center gap-3 overflow-hidden rounded-2xl border px-5 py-4"
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 50% 50%, var(--color-amber-primary), var(--color-orange-cta), var(--color-emerald), var(--color-amber-primary))",
                    padding: "1px",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-amber-primary) 12%, transparent), transparent 70%)",
                  }}
                />

                <motion.div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 8%, var(--color-surface-card))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -10, 10, -5, 0],
                    boxShadow: "0 0 20px color-mix(in srgb, var(--color-amber-primary) 30%, transparent)"
                  }}
                  transition={{
                    scale: { type: "spring", stiffness: 400, damping: 15 },
                    boxShadow: { type: "spring", stiffness: 400, damping: 15 },
                    rotate: { duration: 0.4, ease: "easeOut" },
                  }}
                >
                  <span className="text-2xl">{feat.icon}</span>
                </motion.div>

                <div className="relative z-10 flex-1 min-w-0">
                  <span className="text-text-secondary group-hover:text-text-primary block text-[1rem] leading-snug font-bold transition-colors duration-200">
                    {feat.label}
                  </span>
                </div>

                <motion.div
                  className="pointer-events-none absolute right-3 top-3 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  ✨
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══ Mobile: Vertical feature list ═══ */}
        <motion.div
          className="mt-8 flex flex-col gap-3 px-1 sm:hidden"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {FEATURES.slice(0, 3).map((feat, i) => (
            <motion.div
              key={feat.label}
              variants={fadeUp}
              custom={i}
              className="group flex items-start gap-3.5 rounded-2xl px-4 py-3.5"
              style={{
                background: "color-mix(in srgb, var(--color-surface-card) 60%, transparent)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--color-border-subtle)",
              }}
              whileInView={{
                borderColor: [
                  "var(--color-border-subtle)",
                  "color-mix(in srgb, var(--color-amber-primary) 30%, transparent)",
                  "var(--color-border-subtle)",
                ],
              }}
              transition={{
                borderColor: { duration: 3, repeat: Infinity, delay: i * 1, ease: "easeInOut" },
              }}
              viewport={{ once: false }}
            >
              <motion.span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px]"
                style={{
                  background: "color-mix(in srgb, var(--color-amber-primary) 10%, var(--color-surface-card))",
                  boxShadow: "0 2px 8px color-mix(in srgb, var(--color-amber-primary) 10%, transparent)",
                }}
                animate={{ rotate: [0, -6, 6, -3, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 + i * 0.8, ease: "easeInOut" }}
              >
                {feat.icon}
              </motion.span>
              <p
                className="flex-1 pt-1.5 text-[13px] font-semibold leading-snug"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {feat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
