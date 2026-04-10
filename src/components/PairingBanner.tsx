"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Beer } from "@/features/beers/model/types";

type FeedItem = { icon: string; main: string; sub: string };

const STATIC_TIPS: FeedItem[] = [
  { icon: "💡", main: "El lúpulo actúa como conservante natural", sub: "Tip cervecero" },
  { icon: "🌡️", main: "Las Stouts brillan entre 10°C y 13°C", sub: "Temperatura ideal" },
  { icon: "�️", main: "Las IPAs nacieron para sobrevivir el viaje a India", sub: "Historia cervecera" },
  { icon: "⚗️", main: "Dry-hopping suma aroma sin agregar amargor", sub: "Técnica de lupulado" },
  { icon: "🫧", main: "El CO₂ natural viene de la segunda fermentación", sub: "Bioquímica cervecera" },
  { icon: "�", main: "Las Sour ales usan levaduras salvajes para el toque ácido", sub: "Dato craft" },
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
      items.push({ icon: "�", main: b.name, sub: `${b.style} · ${b.brewery}` })
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

export default function PairingBanner({ beers = [] }: { beers?: Beer[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => buildItems(beers), [beers.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const item = items[index];
  const dotIndex = index % DOT_COUNT;

  return (
    <div
      className="sticky top-16 z-40 w-full overflow-hidden"
      style={{
        background: "color-mix(in srgb, var(--color-surface-card) 88%, var(--color-surface-deepest) 12%)",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-border-amber) 30%, var(--color-border-subtle))",
        boxShadow: "0 1px 0 color-mix(in srgb, var(--color-amber-primary) 6%, transparent)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-3 px-4 sm:px-6">

        {/* Label */}
        <div className="flex shrink-0 items-center gap-1.5">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-amber-primary)" }}
          />
          <span
            className="hidden text-[9px] font-bold uppercase tracking-[0.2em] sm:block"
            style={{ color: "var(--color-amber-primary)" }}
          >
            Últimas noticias
          </span>
        </div>

        {/* Separator */}
        <div
          className="h-4 w-px shrink-0"
          style={{ background: "color-mix(in srgb, var(--color-border-amber) 50%, transparent)" }}
        />

        {/* Animated item */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-sm leading-none">{item.icon}</span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {item.main}
              </span>
              <span className="hidden text-[12px] sm:inline" style={{ color: "var(--color-text-muted)" }}>—</span>
              <span className="hidden truncate text-[12px] italic sm:block" style={{ color: "var(--color-text-secondary)" }}>
                {item.sub}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex shrink-0 items-center gap-1">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIndex(i * Math.floor(items.length / DOT_COUNT))}
              aria-label={`Item ${i + 1}`}
              className="h-1 rounded-full"
              animate={{
                width: i === dotIndex ? 14 : 4,
                background: i === dotIndex ? "var(--color-amber-primary)" : "rgba(255,255,255,0.12)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
