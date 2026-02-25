"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, scaleIn, SectionBadge, GradientText, AmberDivider, ArrowIcon } from "./shared";
import { STORY, type StoryItem } from "./data";

/* ─── Carousel Hook ─── */

function useCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getCardWidth = useCallback(() => {
    return ref.current?.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 320;
  }, []);

  const updateState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    setActiveCard(Math.round(el.scrollLeft / (getCardWidth() + 20)));
  }, [getCardWidth]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    updateState();
    return () => el.removeEventListener("scroll", updateState);
  }, [updateState]);

  const scroll = useCallback(
    (dir: "left" | "right") => {
      const step = getCardWidth() + 20;
      ref.current?.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    },
    [getCardWidth],
  );

  const scrollToIndex = useCallback(
    (i: number) => {
      ref.current?.scrollTo({ left: i * (getCardWidth() + 20), behavior: "smooth" });
    },
    [getCardWidth],
  );

  return { ref, activeCard, canScrollLeft, canScrollRight, scroll, scrollToIndex };
}

/* ─── Sub-components ─── */

function ScrollButton({
  direction,
  enabled,
  onClick,
}: {
  direction: "left" | "right";
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label={direction === "left" ? "Capítulo anterior" : "Capítulo siguiente"}
      className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-default disabled:opacity-25"
      style={{
        borderColor: enabled ? "var(--color-border-amber)" : "var(--color-border-subtle)",
        background: enabled ? "rgba(251,191,36,0.06)" : "transparent",
        color: enabled ? "var(--color-amber-primary)" : "var(--color-text-muted)",
      }}
    >
      <ArrowIcon direction={direction} />
    </button>
  );
}

function StoryCard({ item, index }: { item: StoryItem; index: number }) {
  return (
    <motion.div
      data-card
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="group relative w-[min(80vw,300px)] shrink-0 md:w-auto"
      style={{ scrollSnapAlign: "start" }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500"
        style={{
          background: "var(--gradient-card-glass)",
          borderColor: `${item.accent}22`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1.5px ${item.accent}55, 0 12px 40px ${item.accent}12`,
          }}
          aria-hidden="true"
        />

        <div className="relative overflow-hidden px-6 pt-6">
          <div
            className="absolute top-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
            style={{ background: item.accent }}
            aria-hidden="true"
          />
          <Image
            src={item.img}
            alt={item.title}
            width={360}
            height={240}
            unoptimized
            className="relative mx-auto transition-transform duration-500 group-hover:scale-[1.04]"
            style={{
              width: "100%",
              maxWidth: 220,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.22))",
            }}
          />
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase"
              style={{ background: `${item.accent}18`, color: item.accent }}
            >
              {item.chapter}
            </span>
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>
          </div>

          <h3 className="text-text-primary text-lg font-bold">{item.title}</h3>
          <p className="text-text-muted mt-2 flex-1 text-[13px] leading-relaxed">
            {item.narrative}
          </p>

          <Link
            href={item.href}
            prefetch
            className="mt-5 inline-flex items-center gap-2 self-start text-[13px] font-semibold transition-all duration-200 hover:gap-3"
            style={{ color: item.accent }}
          >
            {item.cta}
            <ArrowIcon direction="right" />
          </Link>
        </div>

        <div
          className="h-0.5 w-full opacity-40 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
          }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

/* ─── Section ─── */

export default function StorySection() {
  const { ref, activeCard, canScrollLeft, canScrollRight, scroll, scrollToIndex } = useCarousel();

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "var(--gradient-section-dark)" }}
      aria-label="Historia cervecera"
    >
      <AmberDivider className="absolute top-0 left-1/2 w-3/4 -translate-x-1/2" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <SectionBadge>Una historia cervecera</SectionBadge>
          <h2 className="text-text-primary mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Desliza y descubre <GradientText>tu aventura</GradientText>
          </h2>
          <p className="text-text-muted mt-3 max-w-lg text-sm leading-relaxed">
            Cuatro capítulos, una sola tribu. Descubre, explora, conecta y escribe tu propia
            leyenda.
          </p>
        </motion.div>

        {/* Mobile carousel controls */}
        <div className="mb-6 flex items-center justify-center gap-4 md:hidden">
          <ScrollButton direction="left" enabled={canScrollLeft} onClick={() => scroll("left")} />

          <div className="flex items-center gap-2">
            {STORY.map((ch, i) => (
              <button
                key={ch.chapter}
                onClick={() => scrollToIndex(i)}
                aria-label={`Ir a ${ch.chapter}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === activeCard ? 24 : 8,
                  background: i === activeCard ? ch.accent : "var(--color-text-ghost)",
                  boxShadow: i === activeCard ? `0 0 8px ${ch.accent}50` : "none",
                }}
              />
            ))}
          </div>

          <ScrollButton
            direction="right"
            enabled={canScrollRight}
            onClick={() => scroll("right")}
          />
        </div>

        {/* Cards: carousel (mobile) → grid (md+) */}
        <div
          ref={ref}
          className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {STORY.map((ch, i) => (
            <StoryCard key={ch.chapter} item={ch} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
