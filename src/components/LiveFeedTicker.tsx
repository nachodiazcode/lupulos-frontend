"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Beer } from "@/features/beers/model/types";

type FeedItem = {
  icon: string;
  text: string;
  sub: string;
};

const BEER_TIPS: FeedItem[] = [
  { icon: "💡", text: "El lúpulo actúa como conservante natural", sub: "Tip cervecero" },
  { icon: "🌡️", text: "Las Stouts brillan entre 10°C y 13°C", sub: "Tip de temperatura" },
  { icon: "🏔️", text: "Las IPAs nacieron para sobrevivir el viaje a India", sub: "Historia cervecera" },
  { icon: "🌾", text: "Una Wheat beer puede llevar hasta 60% de trigo", sub: "Curiosidad maltera" },
  { icon: "⚗️", text: "Dry-hopping suma aroma sin agregar amargor", sub: "Técnica de lupulado" },
  { icon: "🍊", text: "Las Sour ales usan levaduras salvajes para el toque ácido", sub: "Dato craft" },
  { icon: "🫧", text: "El CO₂ natural viene de la segunda fermentación", sub: "Bioquímica cervecera" },
];

function buildFeedItems(beers: Beer[]): FeedItem[] {
  const items: FeedItem[] = [];

  const topLiked = [...beers]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 4);

  topLiked.forEach((b) => {
    if (b.likes.length > 0) {
      items.push({
        icon: "🍻",
        text: b.name,
        sub: `${b.likes.length} brindis · ${b.style}`,
      });
    }
  });

  const topRated = [...beers]
    .filter((b) => (b.averageRating ?? 0) >= 4)
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 3);

  topRated.forEach((b) => {
    items.push({
      icon: "⭐",
      text: b.name,
      sub: `${b.averageRating?.toFixed(1)} ★ · ${b.createdBy?.username ?? b.brewery}`,
    });
  });

  const newest = [...beers]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 3);

  newest.forEach((b) => {
    items.push({
      icon: "🆕",
      text: `${b.name} en el catálogo`,
      sub: `${b.style} · ${b.brewery}`,
    });
  });

  const combined = [...items, ...BEER_TIPS];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
}

const DOT_COUNT = 6;

export default function LiveFeedTicker({ beers }: { beers: Beer[] }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const feedItems = useMemo(
    () => buildFeedItems(beers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beers.length]
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible || dismissed || feedItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % feedItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, dismissed, feedItems.length]);

  if (dismissed || feedItems.length === 0) return null;

  const item = feedItems[currentIndex];
  const dotIndex = currentIndex % DOT_COUNT;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-4 z-30 w-[272px] sm:left-6"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background:
                "color-mix(in srgb, var(--color-surface-card) 96%, var(--color-surface-deepest) 4%)",
              backdropFilter: "blur(22px) saturate(1.2)",
              WebkitBackdropFilter: "blur(22px) saturate(1.2)",
              border:
                "1px solid color-mix(in srgb, var(--color-border-amber) 40%, var(--color-border-light))",
              boxShadow:
                "inset 0 1px 0 color-mix(in srgb, white 12%, transparent), var(--shadow-elevated)",
            }}
          >
            {/* Amber left accent bar */}
            <div
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{ background: "var(--gradient-button-primary)" }}
            />

            <div className="pl-4 pr-3 pt-3 pb-2.5">
              {/* Header row */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--color-amber-primary)" }}
                  />
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "var(--color-amber-primary)" }}
                  >
                    Catálogo live
                  </span>
                </div>
                <button
                  onClick={() => setDismissed(true)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              {/* Animated item */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] leading-none">{item.icon}</span>
                    <p
                      className="truncate text-[12px] font-semibold leading-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.text}
                    </p>
                  </div>
                  <p
                    className="mt-0.5 pl-[23px] text-[10px] leading-tight"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {item.sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="mt-2.5 flex gap-1">
                {Array.from({ length: DOT_COUNT }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-[2px] flex-1 rounded-full"
                    animate={{
                      background:
                        i === dotIndex
                          ? "var(--color-amber-primary)"
                          : "rgba(255,255,255,0.08)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
