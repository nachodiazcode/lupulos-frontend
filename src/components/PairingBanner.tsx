"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Beer } from "@/features/beers/model/types";
import useAuth from "@/hooks/useAuth";

type FeedItem = { icon: string; main: string; sub: string };

const STATIC_TIPS: FeedItem[] = [
  { icon: "💡", main: "El lúpulo actúa como conservante natural", sub: "Tip cervecero" },
  { icon: "🌡️", main: "Las Stouts brillan entre 10°C y 13°C", sub: "Temperatura ideal" },
  { icon: "🗺️", main: "Las IPAs nacieron para sobrevivir el viaje a India", sub: "Historia cervecera" },
  { icon: "⚗️", main: "Dry-hopping suma aroma sin agregar amargor", sub: "Técnica de lupulado" },
  { icon: "🫧", main: "El CO₂ natural viene de la segunda fermentación", sub: "Bioquímica cervecera" },
  { icon: "🍋", main: "Las Sour ales usan levaduras salvajes para el toque ácido", sub: "Dato craft" },
];

function buildItems(beers: Beer[]): FeedItem[] {
  const items: FeedItem[] = [];

  [...beers]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 4)
    .filter((b) => b.likes.length > 0)
    .forEach((b) =>
      items.push({ icon: "🍻", main: b.name, sub: `${b.likes.length} brindis · ${b.style}` })
    );

  [...beers]
    .filter((b) => (b.averageRating ?? 0) >= 4)
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 3)
    .forEach((b) =>
      items.push({ icon: "⭐", main: b.name, sub: `${b.averageRating?.toFixed(1)} ★ · ${b.createdBy?.username ?? b.brewery}` })
    );

  [...beers]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 3)
    .forEach((b) =>
      items.push({ icon: "✨", main: b.name, sub: `${b.style} · ${b.brewery}` })
    );

  const merged = [...items, ...STATIC_TIPS];
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  return merged.length > 0 ? merged : STATIC_TIPS;
}

const INTERVAL_MS = 4500;
const DOT_COUNT = 6;

const TICKER_MASK =
  "linear-gradient(to right, #000 0, #000 calc(100% - 28px), transparent 100%)";

export default function PairingBanner({ beers = [] }: { beers?: Beer[] }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => buildItems(beers), [beers.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const item = items[index];
  // Preserve the original dot/seek mapping so click-to-jump keeps working.
  const seekStep = Math.max(1, Math.floor(items.length / DOT_COUNT));

  return (
    <div
      className="sticky z-40 w-full overflow-hidden"
      style={{
        top: user ? "0px" : "var(--header-height, 64px)",
        background: "color-mix(in srgb, var(--color-surface-card) 88%, var(--color-surface-deepest) 12%)",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-border-amber) 30%, var(--color-border-subtle))",
        // Bottom hairline (kept) + grafted glass top-edge inset highlight.
        boxShadow:
          "0 1px 0 color-mix(in srgb, var(--color-amber-primary) 6%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Inner content axis — matches the /cervezas masthead frame exactly
          (MainLayout: max-w "calc(1140px + 4rem)" + px-4 sm:px-6 lg:px-8),
          so "Últimas noticias" lines up under the page search. Background stays full-bleed. */}
      <div className="mx-auto flex w-full max-w-[calc(1140px+4rem)] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">

        {/* Live indicator + label */}
        <div className="relative flex shrink-0 items-center gap-2">
          {/* Soft radar ring (calm breath, not a loud ping) */}
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{ border: "1px solid color-mix(in srgb, var(--color-amber-primary) 40%, transparent)" }}
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <motion.span
            className="relative h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--color-amber-primary)",
              boxShadow: "0 0 6px color-mix(in srgb, var(--color-amber-primary) 60%, transparent)",
            }}
            animate={reduceMotion ? undefined : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="hidden text-[11px] font-bold uppercase tracking-[0.2em] sm:block"
            style={{ color: "var(--color-amber-primary)" }}
          >
            Últimas noticias
          </span>
        </div>

        {/* Gradient hairline divider (centered rule, not a hard bar) */}
        <div
          className="h-[18px] w-px shrink-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-border-amber) 55%, transparent), transparent)",
          }}
        />

        {/* Ticker viewport — edge-fade mask so text dissolves at both ends.
            Left fade short (18px) so the 20px icon chip never half-clips; right fade longer (28px). */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden"
          style={{ maskImage: TICKER_MASK, WebkitMaskImage: TICKER_MASK }}
        >
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {item.main} — {item.sub}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {/* Amber icon chip — small glass tile framing the emoji */}
              <span
                aria-hidden
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-border-amber) 35%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--color-amber-primary) 14%, transparent)",
                }}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
              </span>
              {/* Headline */}
              <span
                className="text-[15.5px] font-semibold tracking-[-0.01em]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.main}
              </span>
              {/* Sub as a quiet amber category pill (em-dash dropped) — hidden on mobile */}
              <span
                className="hidden items-center rounded-full px-2.5 py-[3px] text-[12.5px] font-medium not-italic tracking-[0.02em] sm:inline-flex"
                style={{
                  color: "color-mix(in srgb, var(--color-amber-primary) 78%, var(--color-text-secondary))",
                  background: "color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-border-amber) 22%, transparent)",
                }}
              >
                {item.sub}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Invisible click-to-seek zones — preserve the old dot navigation as
              keyboard/click affordances without adding visual clutter. Six zones
              map to the same indices the original dots jumped to. */}
          <div className="absolute inset-0 z-10 flex" aria-hidden={false}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => {
              const target = Math.min(i * seekStep, items.length - 1);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(target)}
                  aria-label={`Ir a la noticia ${i + 1}`}
                  className="h-full flex-1 cursor-pointer bg-transparent outline-none focus-visible:ring-1 focus-visible:ring-[color-mix(in_srgb,var(--color-amber-primary)_50%,transparent)]"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Live-time progress fill — replaces the six dots. One hairline that fills over
          the real INTERVAL_MS, keyed on index so it restarts each rotation, and freezes
          mid-sweep on hover (paused). Sits on the existing bottom border, full-bleed. */}
      <motion.div
        key={index}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--color-amber-primary) 35%, transparent) 0%, var(--color-amber-primary) 70%, var(--color-amber-light) 100%)",
          boxShadow: "0 0 6px color-mix(in srgb, var(--color-amber-primary) 45%, transparent)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: paused || reduceMotion ? 0 : 1 }}
        transition={
          paused || reduceMotion
            ? { duration: 0 }
            : { duration: INTERVAL_MS / 1000, ease: "linear" }
        }
      />
    </div>
  );
}
