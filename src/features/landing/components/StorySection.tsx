"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { fadeUp, SectionBadge, GradientText, AmberDivider, ArrowIcon } from "./shared";
import { STORY } from "./data";
import { StoryIllustrations, type StoryIllustrationType } from "./StoryIllustrations";

/* ─── Page flip variants ─── */

const pageVariants: Variants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? 12 : -12,
    x: dir > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? -12 : 12,
    x: dir > 0 ? -120 : 120,
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.3 },
  }),
};

/* ─── Section ─── */

export default function StorySection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const story = STORY[page];

  const go = useCallback(
    (newPage: number) => {
      setPage([newPage, newPage > page ? 1 : -1]);
    },
    [page],
  );

  const prev = useCallback(() => go(page <= 0 ? STORY.length - 1 : page - 1), [go, page]);
  const next = useCallback(() => go(page >= STORY.length - 1 ? 0 : page + 1), [go, page]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20"
      style={{ background: "var(--gradient-section-dark)" }}
      aria-label="Historia cervecera"
    >
      <AmberDivider className="absolute top-0 left-1/2 w-3/4 -translate-x-1/2" />

      <div className="home-content-shell">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <SectionBadge>Una historia en cuatro actos</SectionBadge>
          <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            De la curiosidad al <GradientText>primer brindis</GradientText>
          </h2>
        </motion.div>

        {/* ─── Book container ─── */}
        <div className="relative" style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) prev();
                else if (info.offset.x < -80) next();
              }}
              className="relative overflow-hidden rounded-3xl border"
              style={{
                background: "var(--gradient-card-glass)",
                borderColor: `${story.accent}20`,
                boxShadow: `var(--shadow-card), 0 0 60px ${story.accent}08`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Accent glow */}
              <div
                className="pointer-events-none absolute -top-20 right-0 h-60 w-60 rounded-full opacity-20 blur-[80px]"
                style={{ background: story.accent }}
              />

              <div className="relative grid grid-cols-1 items-center gap-0 md:grid-cols-2">
                {/* Left: Illustration */}
                <div className="relative flex h-[260px] items-center justify-center overflow-hidden px-5 sm:h-[320px] sm:px-8">
                  {/* Background pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                    className="flex h-[220px] items-center justify-center sm:h-[260px]"
                  >
                    {(() => {
                      const IllustrationComponent = StoryIllustrations[story.illustration as StoryIllustrationType];
                      return IllustrationComponent ? <IllustrationComponent /> : null;
                    })()}
                  </motion.div>
                </div>

                {/* Right: Text content */}
                <div className="flex flex-col justify-center px-5 pb-8 sm:px-8 md:py-14 md:pr-10">
                  {/* Chapter tag */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 flex items-center gap-2.5"
                  >
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase"
                      style={{ background: `${story.accent}15`, color: story.accent }}
                    >
                      {story.chapter}
                    </span>
                    <span className="text-lg">{story.icon}</span>
                  </motion.div>

                  {/* Title — fixed height to prevent layout shift */}
                  <motion.h3
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-text-primary min-h-[3.6rem] text-xl font-extrabold tracking-tight sm:min-h-[4rem] sm:text-2xl"
                  >
                    {story.title}
                  </motion.h3>

                  {/* Narrative */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted mt-3 text-sm leading-relaxed sm:text-base"
                  >
                    {story.narrative}
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href={story.href}
                        prefetch
                        className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 hover:gap-3 sm:w-auto"
                        style={{
                          background: `${story.accent}15`,
                          color: story.accent,
                          border: `1px solid ${story.accent}30`,
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {story.cta}
                          <ArrowIcon direction="right" />
                        </span>
                        <span
                          className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-500 group-hover:translate-x-full"
                          style={{ background: `linear-gradient(90deg, transparent, ${story.accent}20, transparent)` }}
                        />
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${story.accent}60, transparent)`,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* ─── Navigation ─── */}
          <div className="mt-8 flex flex-col items-center gap-2">

            {/* Fila de botones + dots — altura fija para que no salte */}
            <div className="flex items-center gap-5">
              {/* Prev */}
              <motion.button
                onClick={prev}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors"
                style={{
                  borderColor: "var(--color-border-amber)",
                  background: "color-mix(in srgb, var(--color-amber-primary) 5%, transparent)",
                  color: "var(--color-amber-primary)",
                }}
                aria-label="Capítulo anterior"
              >
                <ArrowIcon direction="left" />
              </motion.button>

              {/* Dots — solo puntos, sin label dentro */}
              <div className="flex items-center gap-3">
                {STORY.map((ch, i) => (
                  <button
                    key={ch.chapter}
                    onClick={() => go(i)}
                    aria-label={ch.chapter}
                    className="flex items-center justify-center"
                    style={{ height: 20 }}
                  >
                    <motion.div
                      className="rounded-full"
                      animate={{
                        width: i === page ? 28 : 8,
                        height: 8,
                        backgroundColor:
                          i === page ? ch.accent : "var(--color-text-ghost)",
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        boxShadow:
                          i === page ? `0 0 10px ${ch.accent}50` : "none",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Next */}
              <motion.button
                onClick={next}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors"
                style={{
                  borderColor: "var(--color-border-amber)",
                  background: "color-mix(in srgb, var(--color-amber-primary) 5%, transparent)",
                  color: "var(--color-amber-primary)",
                }}
                aria-label="Capítulo siguiente"
              >
                <ArrowIcon direction="right" />
              </motion.button>
            </div>

            {/* Label del capítulo activo — fila propia, sin afectar altura de los botones */}
            <AnimatePresence mode="wait">
              <motion.span
                key={page}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.22 }}
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: STORY[page].accent }}
              >
                {STORY[page].chapter}
              </motion.span>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
