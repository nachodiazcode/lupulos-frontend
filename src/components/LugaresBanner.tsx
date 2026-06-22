"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Place } from "@/features/lugares/types";
import useAuth from "@/hooks/useAuth";

type FeedItem = { icon: string; main: string; sub: string };

const STATIC_TIPS: FeedItem[] = [
  { icon: "🗺️", main: "Arma tu ruta cervecera y compártela con la crew", sub: "Tip Lúpulos" },
  { icon: "☀️", main: "Filtra por terraza para las tardes de sol", sub: "Modo terraza" },
  { icon: "🎸", main: "Hay locales con música en vivo esta semana", sub: "Agenda viva" },
  { icon: "🐾", main: "Varios spots son pet-friendly para ir con tu engreído", sub: "Pet-friendly" },
  { icon: "📍", main: "¿Falta tu bar de barrio? Nomínalo en un toque", sub: "Suma al mapa" },
];

function avgRating(place: Place) {
  if (!place.reviews?.length) return 0;
  return place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length;
}

/**
 * El feed de /location llega ya ordenado de más nuevo a más antiguo (la página
 * hace `.reverse()` al cargar), así que el orden del array refleja la recencia.
 */
function buildItems(places: Place[]): FeedItem[] {
  const items: FeedItem[] = [];

  // Recién subidos a la comunidad
  places.slice(0, 4).forEach((p) =>
    items.push({
      icon: "✨",
      main: p.name,
      sub: `Recién subido · ${p.address?.city ?? "Chile"}`,
    })
  );

  // Mejor evaluados por la comunidad
  [...places]
    .filter((p) => avgRating(p) >= 4)
    .sort((a, b) => avgRating(b) - avgRating(a))
    .slice(0, 3)
    .forEach((p) =>
      items.push({
        icon: "⭐",
        main: p.name,
        sub: `${avgRating(p).toFixed(1)} ★ · ${p.address?.city ?? ""}`.trim(),
      })
    );

  // Destacados / con más guardados
  [...places]
    .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0))
    .slice(0, 3)
    .filter((p) => p.isFeatured || (p.likes?.length ?? 0) > 0)
    .forEach((p) =>
      items.push({
        icon: p.isFeatured ? "👑" : "🔥",
        main: p.name,
        sub: p.isFeatured
          ? `Destacado · ${p.address?.city ?? ""}`.trim()
          : `${p.likes?.length} guardados · ${p.address?.city ?? ""}`.trim(),
      })
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

export default function LugaresBanner({ places = [] }: { places?: Place[] }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => buildItems(places), [places.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const item = items[index];
  const seekStep = Math.max(1, Math.floor(items.length / DOT_COUNT));

  return (
    <div
      className="sticky z-40 w-full overflow-hidden"
      style={{
        top: user ? "0px" : "var(--header-height, 64px)",
        background:
          "color-mix(in srgb, var(--color-surface-card) 88%, var(--color-surface-deepest) 12%)",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        borderBottom:
          "1px solid color-mix(in srgb, var(--color-border-amber) 30%, var(--color-border-subtle))",
        boxShadow:
          "0 1px 0 color-mix(in srgb, var(--color-amber-primary) 6%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Eje interno — calza exactamente con el masthead de /lugares
          (MainLayout: max-w "calc(1140px + 4rem)" + px-4 sm:px-6 lg:px-8),
          para que "Últimos lugares" quede bajo la búsqueda de la página. */}
      <div className="mx-auto flex w-full max-w-[calc(1140px+4rem)] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        {/* Indicador live + etiqueta */}
        <div className="relative flex shrink-0 items-center gap-2">
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{
                border:
                  "1px solid color-mix(in srgb, var(--color-amber-primary) 40%, transparent)",
              }}
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <motion.span
            className="relative h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--color-amber-primary)",
              boxShadow:
                "0 0 6px color-mix(in srgb, var(--color-amber-primary) 60%, transparent)",
            }}
            animate={reduceMotion ? undefined : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="hidden text-[11px] font-bold uppercase tracking-[0.2em] sm:block"
            style={{ color: "var(--color-amber-primary)" }}
          >
            Últimos lugares
          </span>
        </div>

        {/* Divisor hairline */}
        <div
          className="h-[18px] w-px shrink-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-border-amber) 55%, transparent), transparent)",
          }}
        />

        {/* Ticker */}
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
              <span
                aria-hidden
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-border-amber) 35%, transparent)",
                  boxShadow:
                    "inset 0 1px 0 color-mix(in srgb, var(--color-amber-primary) 14%, transparent)",
                }}
              >
                <span className="text-[15px] leading-none">{item.icon}</span>
              </span>
              <span
                className="text-[15.5px] font-semibold tracking-[-0.01em]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.main}
              </span>
              <span
                className="hidden items-center rounded-full px-2.5 py-[3px] text-[12.5px] font-medium not-italic tracking-[0.02em] sm:inline-flex"
                style={{
                  color:
                    "color-mix(in srgb, var(--color-amber-primary) 78%, var(--color-text-secondary))",
                  background:
                    "color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-border-amber) 22%, transparent)",
                }}
              >
                {item.sub}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Zonas invisibles de click-to-seek */}
          <div className="absolute inset-0 z-10 flex" aria-hidden={false}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => {
              const target = Math.min(i * seekStep, items.length - 1);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(target)}
                  aria-label={`Ir al lugar ${i + 1}`}
                  className="h-full flex-1 cursor-pointer bg-transparent outline-none focus-visible:ring-1 focus-visible:ring-[color-mix(in_srgb,var(--color-amber-primary)_50%,transparent)]"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra de progreso live */}
      <motion.div
        key={index}
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--color-amber-primary) 35%, transparent) 0%, var(--color-amber-primary) 70%, var(--color-amber-light) 100%)",
          boxShadow:
            "0 0 6px color-mix(in srgb, var(--color-amber-primary) 45%, transparent)",
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
