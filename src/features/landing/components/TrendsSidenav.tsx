"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════
   Data — simulated real-time trends
   ═══════════════════════════════════ */

interface TrendItem {
  id: string;
  emoji: string;
  label: string;
  detail: string;
  hot?: boolean;
}

const TRENDING_NOW: TrendItem[] = [
  { id: "t1", emoji: "🔥", label: "Hazy IPA", detail: "+42% esta semana", hot: true },
  { id: "t2", emoji: "📈", label: "Imperial Stout", detail: "+28% búsquedas" },
  { id: "t3", emoji: "🍊", label: "Sour de maracuyá", detail: "Tendencia nueva", hot: true },
  { id: "t4", emoji: "🌾", label: "West Coast IPA", detail: "+19% interés" },
  { id: "t5", emoji: "🍫", label: "Porter con cacao", detail: "Subiendo fuerte" },
];

interface ActivityItem {
  id: string;
  emoji: string;
  text: string;
  time: string;
}

const LIVE_ACTIVITY: ActivityItem[] = [
  { id: "a1", emoji: "⭐", text: "Nueva reseña 4.8★ para Kross Session IPA", time: "hace 1m" },
  { id: "a2", emoji: "🆕", text: "Cervecería Nómade lanzó Neblina Hazy", time: "hace 4m" },
  { id: "a3", emoji: "📍", text: "Nuevo taproom en Barrio Yungay", time: "hace 7m" },
  { id: "a4", emoji: "🏆", text: "Atrapaniebla subió al #2 del ranking", time: "hace 11m" },
  { id: "a5", emoji: "🔥", text: "Debate: ¿West Coast o Hazy IPA?", time: "hace 14m" },
  { id: "a6", emoji: "🍻", text: "Check-in en Taproom La Quimera", time: "hace 17m" },
  { id: "a7", emoji: "📸", text: "12 fotos nuevas: Noche de Stouts", time: "hace 21m" },
  { id: "a8", emoji: "🧠", text: "IA recomendó 3 Pale Ales a 18 usuarios", time: "hace 24m" },
];

interface NewsItem {
  id: string;
  emoji: string;
  headline: string;
  source: string;
}

const BEER_NEWS: NewsItem[] = [
  { id: "n1", emoji: "🏆", headline: "Chile suma 3 medallas en World Beer Cup 2026", source: "Lúpulos News" },
  { id: "n2", emoji: "🌱", headline: "Lúpulo patagónico: la cepa chilena que sorprende al mundo", source: "Reportaje" },
  { id: "n3", emoji: "📅", headline: "Bierfest Santiago 2026 confirma fecha y cervecerías", source: "Eventos" },
  { id: "n4", emoji: "🔬", headline: "Fermentación mixta: por qué todos quieren probarla", source: "Blog Lúpulos" },
];

/* ═══════════════════════════════════
   Liquid Glass Border (adapted)
   ═══════════════════════════════════ */

function LiquidGlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Conic gradient border — subtle version */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          background:
            "conic-gradient(from 180deg, rgba(251,191,36,0.25), rgba(245,158,11,0.12), rgba(52,211,153,0.10), rgba(96,165,250,0.08), rgba(167,139,250,0.10), rgba(245,158,11,0.15), rgba(251,191,36,0.25))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: 1,
          borderRadius: "inherit",
        }}
        aria-hidden="true"
      />

      {/* Glass surface */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(15, 12, 8, 0.55)",
          backdropFilter: "blur(28px) saturate(1.5)",
          WebkitBackdropFilter: "blur(28px) saturate(1.5)",
          border: "1px solid rgba(251,191,36,0.08)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.3), 0 0 80px rgba(251,191,36,0.03)",
        }}
      >
        {/* Top glass reflection */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-12"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Liquid sweep shimmer */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(251,191,36,0.04) 45%, rgba(251,191,36,0.06) 50%, rgba(251,191,36,0.04) 55%, transparent 60%)",
            backgroundSize: "250% 100%",
            animation: "glass-liquid-sweep 8s ease-in-out infinite",
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
    <div className="px-4 pt-4 pb-3">
      <SectionTitle emoji="📊" title="Tendencias" />
      <ul className="space-y-2">
        {TRENDING_NOW.slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span className="text-sm">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <span
                className="block truncate text-xs font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.label}
                {item.hot && (
                  <span
                    className="ml-1.5 inline-block rounded-full px-1.5 py-px text-[9px] font-bold uppercase"
                    style={{
                      background: "rgba(251,191,36,0.15)",
                      color: "var(--color-amber-primary)",
                    }}
                  >
                    hot
                  </span>
                )}
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

function LiveActivitySection() {
  const [visibleItems, setVisibleItems] = useState<ActivityItem[]>(LIVE_ACTIVITY.slice(0, 3));
  const [currentIdx, setCurrentIdx] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        const nextIdx = prev >= LIVE_ACTIVITY.length ? 0 : prev;
        setVisibleItems((items) => {
          const newItems = [LIVE_ACTIVITY[nextIdx], ...items.slice(0, 2)];
          return newItems;
        });
        return nextIdx + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-3">
      <SectionTitle emoji="⚡" title="Ahora mismo" />
      <ul className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, i) => (
            <motion.li
              key={item.id + "-" + i}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-start gap-2"
            >
              <span className="mt-px text-xs">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[11px] leading-snug font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {item.text}
                </p>
                <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                  {item.time}
                </span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function NewsSection() {
  return (
    <div className="px-4 pt-3 pb-4">
      <SectionTitle emoji="📰" title="Noticias" />
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
            "linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)",
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

  // Show after a small delay for a nice entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Desktop only — hidden below xl */}
      <motion.aside
        className="fixed z-40 hidden xl:block"
        style={{
          top: 80, // below navbar (64px) + 16px spacing
          right: 16,
          width: 240,
        }}
        initial={{ opacity: 0, x: 40 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
        transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.2 }}
      >
        <LiquidGlassPanel>
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: 420,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(251,191,36,0.2) transparent",
            }}
          >
            {/* Trending — always visible */}
            <TrendingSection />
            <GlassDivider />

            {/* Live Activity — always visible */}
            <LiveActivitySection />

            {/* ── Scrollable zone below ── */}
            <GlassDivider />

            {/* News — visible on scroll */}
            <NewsSection />

            {/* Bottom subtle branding */}
            <div className="px-4 pb-3 pt-1 text-center">
              <span
                className="text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
              >
                Lúpulos · En vivo
              </span>
            </div>
          </div>
        </LiquidGlassPanel>

        {/* Scroll hint: subtle fade at the bottom with matching rounded corners */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-10 overflow-hidden rounded-b-2xl"
          style={{
            background: "linear-gradient(to top, rgba(15,12,8,0.65), transparent)",
          }}
          aria-hidden="true"
        />
      </motion.aside>
    </>
  );
}
