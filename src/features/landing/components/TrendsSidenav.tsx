"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════
   Data — exploratory sidebar content
   ═══════════════════════════════════ */

interface TrendItem {
  id: string;
  emoji: string;
  label: string;
  detail: string;
  hot?: boolean;
}

const TRENDING_NOW: TrendItem[] = [
  { id: "t1", emoji: "🌫️", label: "Hazy IPA", detail: "Tropical, sedosa y muy aromática" },
  { id: "t2", emoji: "🖤", label: "Imperial Stout", detail: "Oscura, intensa y tostada" },
  { id: "t3", emoji: "🍊", label: "Sour de maracuyá", detail: "Ácida, frutal y refrescante" },
  { id: "t4", emoji: "🌲", label: "West Coast IPA", detail: "Resinosa, seca y clásica" },
  { id: "t5", emoji: "🍫", label: "Porter con cacao", detail: "Maltosa y golosa para explorar" },
];

interface DiscoveryItem {
  id: string;
  emoji: string;
  text: string;
  detail: string;
}

const DISCOVERY_ITEMS: DiscoveryItem[] = [
  { id: "d1", emoji: "📍", text: "Taprooms en Santiago", detail: "Para una primera ruta cervecera" },
  { id: "d2", emoji: "🌊", text: "Bares en Valparaíso", detail: "Pintas con vista y buena conversación" },
  { id: "d3", emoji: "🍺", text: "Cervezas para empezar", detail: "Opciones fáciles si recién entras al mundo artesanal" },
  { id: "d4", emoji: "🌾", text: "Lagers con carácter", detail: "Más expresivas, pero igual de tomables" },
  { id: "d5", emoji: "🌿", text: "IPAs chilenas", detail: "Cítricas, resinosas y con personalidad" },
  { id: "d6", emoji: "🗺️", text: "Barrios para salir", detail: "Zonas donde siempre aparece un buen hallazgo" },
];

interface NewsItem {
  id: string;
  emoji: string;
  headline: string;
  source: string;
}

const BEER_NEWS: NewsItem[] = [
  { id: "n1", emoji: "🧭", headline: "Cómo elegir tu primera IPA sin perderte en el intento", source: "Guía rápida" },
  { id: "n2", emoji: "🍯", headline: "Qué pedir si prefieres cervezas más suaves y menos amargas", source: "Para empezar" },
  { id: "n3", emoji: "🏠", headline: "Bares con buena barra, conversación y cerveza artesanal", source: "Para salir" },
  { id: "n4", emoji: "✨", headline: "Por dónde empezar si quieres explorar nuevos estilos", source: "Explora" },
];

/* ═══════════════════════════════════
   Liquid Glass Border (adapted)
   ═══════════════════════════════════ */

function LiquidGlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Panel surface */}
      <div
        className="relative overflow-hidden rounded-[1.75rem]"
        style={{
          background:
            "color-mix(in srgb, var(--color-surface-card) 92%, var(--color-surface-deepest) 8%)",
          backdropFilter: "blur(18px) saturate(1.15)",
          WebkitBackdropFilter: "blur(18px) saturate(1.15)",
          border: "1px solid color-mix(in srgb, var(--color-border-light) 88%, white 12%)",
          boxShadow:
            "inset 0 1px 0 color-mix(in srgb, white 16%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--color-amber-primary) 6%, transparent), var(--shadow-elevated)",
        }}
      >
        {/* Full frame reinforcement */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-amber-light) 22%, var(--color-border-light))",
            boxShadow:
              "inset 0 0 0 1px color-mix(in srgb, white 6%, transparent)",
          }}
          aria-hidden="true"
        />

        {/* Bottom rim highlight */}
        <div
          className="pointer-events-none absolute inset-x-5 bottom-[1px] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-light) 48%, transparent), transparent)",
            opacity: 0.75,
          }}
          aria-hidden="true"
        />

        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Section Components
   ═══════════════════════════════════ */

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-sm">{emoji}</span>
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-amber-primary)" }}
      >
        {title}
      </span>
    </div>
  );
}

function TrendingSection() {
  return (
    <div className="px-5 pt-4 pb-3">
      <SectionTitle emoji="📊" title="Tendencias" />
      <ul className="space-y-3">
        {TRENDING_NOW.slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span className="text-sm">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <span
                className="block truncate text-xs font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.label}
              </span>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                {item.detail}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiscoverySection() {
  return (
    <div className="px-5 py-3.5">
      <SectionTitle emoji="🧭" title="Para descubrir" />
      <ul className="space-y-2.5">
        {DISCOVERY_ITEMS.slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="mt-px text-xs">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] leading-snug font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.text}
              </p>
              <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                {item.detail}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsSection() {
  return (
    <div className="px-5 pt-3.5 pb-5">
      <SectionTitle emoji="✨" title="Empieza por aquí" />
      <ul className="space-y-2.5">
        {BEER_NEWS.slice(0, 3).map((item) => (
          <li key={item.id} className="group cursor-pointer">
            <div className="flex items-start gap-2">
              <span className="mt-px text-xs">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] leading-snug font-semibold transition-colors duration-200 group-hover:text-amber-primary"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.headline}
                </p>
                <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                  {item.source}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════
   Divider
   ═══════════════════════════════════ */

function GlassDivider() {
  return (
    <div className="px-4">
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-border-amber) 90%, transparent), transparent)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ═══════════════════════════════════
   Main Sidenav
   ═══════════════════════════════════ */

export default function TrendsSidenav() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show after a small delay for a nice entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.aside
          className="fixed z-40 hidden xl:block"
          style={{
            top: 80,
            right: 16,
            width: 240,
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          exit={{ opacity: 0, x: 32, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.2 }}
        >
          <LiquidGlassPanel>
            <div
              className="overflow-hidden rounded-[1.75rem]"
              style={{
                maxHeight: 448,
              }}
            >
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-subtle) 86%, white 14%)",
                  background: "color-mix(in srgb, var(--color-surface-card) 82%, transparent)",
                  color: "var(--color-text-muted)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, white 12%, transparent)",
                }}
                aria-label="Cerrar panel de tendencias"
              >
                ×
              </button>

              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 40%, transparent), transparent)",
                }}
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute inset-x-[1px] bottom-[1px] z-10 h-14 rounded-b-[1.68rem]"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent), transparent)",
                }}
                aria-hidden="true"
              />

              <div
                className="overflow-y-auto rounded-[1.75rem] pt-4"
                style={{
                  maxHeight: 448,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(251,191,36,0.2) transparent",
                }}
              >
                <TrendingSection />
                <GlassDivider />
                <DiscoverySection />
                <GlassDivider />
                <NewsSection />

                <div className="px-5 pb-5 pt-1 text-center">
                  <span
                    className="text-[9px] font-medium uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
                  >
                    Lúpulos · Para explorar
                  </span>
                </div>
              </div>
            </div>
          </LiquidGlassPanel>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
