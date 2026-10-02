"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  Reorder,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
  type Variants,
} from "framer-motion";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";

import Footer from "@/components/Footer";
import BeerFormModal from "@/features/beers/components/BeerFormModal";
import PairingBanner from "@/components/PairingBanner";
import { useBeers } from "@/features/beers/hooks/useBeers";
import type { Beer } from "@/features/beers/model/types";
import MainLayout from "@/components/layouts/MainLayout";
import BeerCard from "@/components/ui/BeerCard";
import { SidebarWidget } from "@/components/ui/SidebarWidget";

/* ═══════════════════════════════════
   Gradient Border (search bar)
   ═══════════════════════════════════ */

function GradientBorder({
  children,
  active = false,
  radius = 20,
  borderWidth = 1.5,
}: {
  children: React.ReactNode;
  active?: boolean;
  radius?: number;
  borderWidth?: number;
}) {
  const rotation = useMotionValue(0);

  useEffect(() => {
    const ctrl = fmAnimate(rotation, 360, {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    });
    return () => ctrl.stop();
  }, [rotation]);

  const background = useTransform(
    rotation,
    (r) =>
      `conic-gradient(from ${r}deg, #fbbf24, #f59e0b, #34d399, #3b82f6, #a855f7, #f59e0b, #fbbf24)`,
  );

  return (
    <div className="relative" style={{ borderRadius: radius, padding: borderWidth }}>
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          background,
          opacity: active ? 0.8 : 0.4,
          transition: "opacity 0.3s",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          background,
          filter: "blur(12px)",
          opacity: active ? 0.2 : 0.08,
          transition: "opacity 0.3s",
        }}
      />
      <div className="relative" style={{ borderRadius: radius - borderWidth }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Magic Search Icon
   ═══════════════════════════════════ */

const SPARKLE_COLORS = ["#a855f7", "#8b5cf6", "#c084fc", "#6366f1"];

function MagicSearchIcon({ active = false }: { active?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
      {/* Orbiting sparkles — only when focused */}
      {SPARKLE_COLORS.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            left: 12,
            top: 12,
          }}
          animate={
            active
              ? {
                  x: [
                    Math.cos((i * Math.PI) / 2) * 14,
                    Math.cos((i * Math.PI) / 2 + Math.PI) * 14,
                    Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 14,
                  ],
                  y: [
                    Math.sin((i * Math.PI) / 2) * 14,
                    Math.sin((i * Math.PI) / 2 + Math.PI) * 14,
                    Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 14,
                  ],
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.6, 1, 0.6],
                }
              : { x: 0, y: 0, scale: 0, opacity: 0 }
          }
          transition={
            active
              ? {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear" as const,
                  delay: i * 0.3,
                }
              : { duration: 0.2 }
          }
        />
      ))}

      {/* Glow ring on focus */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          active
            ? {
                boxShadow: [
                  "0 0 0px 0px rgba(168,85,247,0)",
                  "0 0 12px 3px rgba(168,85,247,0.35)",
                  "0 0 0px 0px rgba(168,85,247,0)",
                ],
              }
            : { boxShadow: "0 0 0px 0px rgba(168,85,247,0)" }
        }
        transition={active ? { duration: 2, repeat: Infinity, ease: "easeInOut" as const } : {}}
      />

      {/* Lupa SVG — violeta mágica */}
      <motion.svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-1/2 top-1/2"
        style={{
          x: "-50%",
          y: "-50%",
          transition: "filter 0.3s",
        }}
        animate={
          active
            ? { rotate: [0, -10, 10, -5, 0], scale: [1, 1.08, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={
          active
            ? { duration: 0.6, ease: "easeOut" as const }
            : { duration: 0.3 }
        }
      >
        {/* Gradient defs */}
        <defs>
          <linearGradient id="lupa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="lupa-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="11"
          cy="11"
          r="7"
          stroke="url(#lupa-grad)"
          strokeWidth="3"
          animate={active ? { r: 6.5, strokeWidth: 3.5 } : { r: 7, strokeWidth: 3 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="m19.5 19.5-3.5-3.5"
          stroke="url(#lupa-grad)"
          strokeWidth="3.2"
          animate={active ? { strokeWidth: 3.8 } : { strokeWidth: 3.2 }}
          transition={{ duration: 0.3 }}
        />
        {/* Inner magic dot — appears on focus */}
        <motion.circle
          cx="11"
          cy="11"
          r="2.5"
          fill="url(#lupa-glow)"
          stroke="none"
          animate={
            active
              ? { scale: [0, 1.3, 0.9, 1.1, 1], opacity: [0, 1, 0.8, 1] }
              : { scale: 0, opacity: 0 }
          }
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
    </div>
  );
}

/* ═══════════════════════════════════
   AI Sommelier — Typewriter placeholder
   ═══════════════════════════════════ */

const SOMMELIER_HINTS = [
  "Recomiéndame una IPA frutal y aromática...",
  "Busco una cerveza suave para el verano ☀️",
  "¿Cuál es la mejor Stout con notas de café?",
  "Algo lupulado pero no tan amargo...",
  "Una Lager refrescante estilo alemán 🍻",
  "Quiero probar algo nuevo, sorpréndeme...",
  "¿Qué cerveza va bien con un asado? 🔥",
  "Busco una Sour afrutada y ácida...",
];

function useTypewriter(phrases: string[], speed = 45, pause = 2200, deleteSpeed = 25) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!isDeleting && text === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const delta = isDeleting ? deleteSpeed : speed;
      timeoutRef.current = setTimeout(() => {
        setText((prev) =>
          isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
        );
      }, delta);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, phraseIndex, isDeleting, phrases, speed, pause, deleteSpeed]);

  return text;
}

/* Suggestion chips for quick search */
const QUICK_SUGGESTIONS = [
  { label: "🌿 IPA", query: "IPA" },
  { label: "☕ Stout", query: "Stout" },
  { label: "🌾 Wheat", query: "Wheat" },
  { label: "🍊 Sour", query: "Sour" },
  { label: "🥂 Lager", query: "Lager" },
  { label: "🔥 Amber", query: "Amber" },
];

/* ═══════════════════════════════════
   Animation variants
   ═══════════════════════════════════ */

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};



const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};



/* ═══════════════════════════════════
   Widget registry (sidebar)
   ═══════════════════════════════════ */

const WIDGET_REGISTRY = [
  { id: "cerveza-del-dia",  emoji: "☀️", label: "Cerveza del día" },
  { id: "encuesta",          emoji: "📊", label: "Encuesta" },
  { id: "explorar-estilo",  emoji: "🍺", label: "Explorar por estilo" },
  { id: "tips",              emoji: "💡", label: "¿Sabías que...?" },
  { id: "cerveceros",        emoji: "⭐", label: "Cerveceros destacados" },
] as const;

type WidgetId = (typeof WIDGET_REGISTRY)[number]["id"];
const DEFAULT_WIDGETS: WidgetId[] = ["cerveza-del-dia", "encuesta"];
const SIDEBAR_STORAGE_KEY = "cervezas_sidebar_widgets_v1";
const COLLAPSED_STORAGE_KEY = "cervezas_sidebar_collapsed_v1";

/* ═══════════════════════════════════
   Page
   ═══════════════════════════════════ */

export default function CervezasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [user, setUser] = useState<{ _id: string; username: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [pollVote, setPollVote] = useState<string | null>(null);
  const [sidebarDismissed, setSidebarDismissed] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [collapsedWidgets, setCollapsedWidgets] = useState<WidgetId[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dailyBeer, setDailyBeer] = useState<{ name: string; style: string; abv: number; description: string; id?: string } | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const typedPlaceholder = useTypewriter(SOMMELIER_HINTS);
  const { beers: cervezas, isLoading, refreshBeers, onToggleLike } = useBeers(activeQuery);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      try { setEnabledWidgets(JSON.parse(stored) as WidgetId[]); } catch {}
    }
    const storedCol = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (storedCol) {
      try { setCollapsedWidgets(JSON.parse(storedCol) as WidgetId[]); } catch {}
    }
  }, []);

  useEffect(() => {
    if (cervezas && cervezas.length > 0 && !dailyBeer && !activeQuery) {
      const best = [...cervezas].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];
      if (best) {
        setDailyBeer({
          name: best.name,
          style: best.style || "Estilo artesanal",
          abv: best.abv,
          description: best.description || "",
          id: best._id,
        });
      }
    }
  }, [cervezas, dailyBeer, activeQuery]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPickerOpen(false);
        setModalOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPickerOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleWidget = (id: WidgetId) => {
    setEnabledWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
      if (next.length === WIDGET_REGISTRY.length) setPickerOpen(false);
      return next;
    });
  };

  const removeWidget = (id: WidgetId) => {
    setEnabledWidgets((prev) => {
      const next = prev.filter((w) => w !== id);
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleCollapse = (id: WidgetId) => {
    setCollapsedWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const renderWidget = (id: WidgetId): React.ReactNode => {
    switch (id) {
      case "cerveza-del-dia": return (
        <SidebarWidget 
          label="DESTACADO"
          collapsed={collapsedWidgets.includes(id)}
          onClose={() => removeWidget(id)}
          onToggleCollapse={() => toggleCollapse(id)}
        >
          <div className="flex items-start gap-3 mt-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl border border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              ☀️
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-white leading-snug" style={{ fontSize: "18px" }}>
                {dailyBeer?.name || "Volcanes del Sur Pilsner"}
              </h4>
              <p className="mt-0.5" style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
                {dailyBeer?.style || "Czech Pilsner"} · {dailyBeer?.abv || 4.5}% ABV
              </p>
            </div>
          </div>

          <p className="leading-relaxed mt-2.5 font-medium" style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {dailyBeer?.description || "Pilsner bohemia con agua del volcán Villarrica. Maltosa, dorada y con un amargor floral delicado."}
          </p>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(251,191,36,0.08)", borderColor: "var(--color-amber-primary)", boxShadow: "0 0 12px rgba(251,191,36,0.1)" }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => { 
              if (dailyBeer?.id) {
                router.push(`/cervezas/${dailyBeer.id}`);
              } else {
                setSearchQuery("Pilsner"); 
                setActiveQuery("Pilsner"); 
              }
            }} 
            className="mt-3.5 w-full rounded-xl border py-2 font-semibold transition-all duration-200 text-[var(--color-amber-primary)] flex items-center justify-center gap-1.5" 
            style={{ 
              fontSize: "11px",
              borderColor: "rgba(251,191,36,0.3)",
              background: "rgba(251,191,36,0.03)"
            }}
          >
            <span>{dailyBeer?.id ? "Ver Ficha Completa" : "Explorar Pilsners"}</span>
            <span>→</span>
          </motion.button>
        </SidebarWidget>
      );
      case "encuesta": return (
        <SidebarWidget 
          label="ENCUESTA"
          collapsed={collapsedWidgets.includes(id)}
          onClose={() => removeWidget(id)}
          onToggleCollapse={() => toggleCollapse(id)}
        >
          <div className="space-y-2 mt-1">
            {[
              { label: "IPA bien lupulada", emoji: "🌿", pct: 38 }, 
              { label: "Stout cremosa", emoji: "☕", pct: 27 }, 
              { label: "Lager clásica", emoji: "🥂", pct: 22 }, 
              { label: "Sour frutal", emoji: "🍊", pct: 13 }
            ].map((opt) => {
              const voted = pollVote !== null;
              const isSelected = pollVote === opt.label;
              return (
                <motion.button 
                  key={opt.label} 
                  whileHover={!voted ? { y: -1, backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(251,191,36,0.25)" } : {}} 
                  whileTap={!voted ? { scale: 0.98 } : {}} 
                  onClick={() => !voted && setPollVote(opt.label)} 
                  className="relative w-full overflow-hidden rounded-xl border px-3 py-2 flex items-center justify-between transition-all duration-200 min-h-[38px]" 
                  style={{ 
                    borderColor: isSelected ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-light) 66%, transparent)", 
                    background: isSelected ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.01)",
                    cursor: voted ? "default" : "pointer"
                  }}
                >
                  {voted && (
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${opt.pct}%` }} 
                      transition={{ type: "spring", stiffness: 100, damping: 15 }} 
                      className="absolute inset-y-0 left-0 rounded-xl" 
                      style={{ background: isSelected ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)" }} 
                    />
                  )}
                  <div className="relative flex items-center gap-2.5">
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded bg-white/[0.03] text-[11px] border border-white/[0.02]">
                      {opt.emoji}
                    </span>
                    <span 
                      className="text-[11px] font-semibold text-white" 
                      style={{ color: isSelected ? "var(--color-amber-primary)" : "var(--color-text-primary)" }}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {voted && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="relative text-[10px] font-bold" 
                      style={{ color: isSelected ? "var(--color-amber-primary)" : "var(--color-text-secondary)" }}
                    >
                      {opt.pct}%
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {pollVote && (
            <motion.p 
              initial={{ opacity: 0, y: 4 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-3 text-center text-[10px]" 
              style={{ color: "var(--color-text-muted)" }}
            >
              ¡Gracias por tu voto! 🗳️ 127 participantes
            </motion.p>
          )}
        </SidebarWidget>
      );
      case "explorar-estilo": return (
        <SidebarWidget 
          label="ESTILOS"
          collapsed={collapsedWidgets.includes(id)}
          onClose={() => removeWidget(id)}
          onToggleCollapse={() => toggleCollapse(id)}
        >
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[
              { label: "🌿 IPA", query: "IPA" },
              { label: "☕ Stout", query: "Stout" },
              { label: "🌾 Lager", query: "Lager" },
              { label: "🪵 Porter", query: "Porter" },
              { label: "🌾 Wheat", query: "Wheat" },
              { label: "🥖 Pale Ale", query: "Pale Ale" },
              { label: "🍊 Sour", query: "Sour" },
              { label: "🔥 Amber", query: "Amber" }
            ].map((s, i) => (
              <motion.button 
                key={s.query} 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: i * 0.03 }} 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(251,191,36,0.2)" }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => { setSearchQuery(s.query); setActiveQuery(s.query); }} 
                className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-all duration-200 flex items-center gap-1 shrink-0" 
                style={{ 
                  borderColor: activeQuery === s.query ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-light) 66%, transparent)", 
                  color: activeQuery === s.query ? "var(--color-amber-primary)" : "var(--color-text-secondary)", 
                  background: activeQuery === s.query ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.01)",
                  boxShadow: activeQuery === s.query ? "0 0 10px rgba(251,191,36,0.05)" : "none"
                }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>
        </SidebarWidget>
      );
      case "tips": return (
        <SidebarWidget 
          label="TIPS"
          collapsed={collapsedWidgets.includes(id)}
          onClose={() => removeWidget(id)}
          onToggleCollapse={() => toggleCollapse(id)}
        >
          <div className="space-y-2.5 mt-1">
            {[
              { icon: "🌿", title: "Amargor histórico", text: "Las IPAs nacieron para resistir el viaje a la India: el lúpulo actuaba como conservante natural." },
              { icon: "☕", title: "Servicio Stout", text: "Sirve la Stout entre 10°C y 13°C. Demasiado fría oculta sus exquisitas notas de chocolate y café tostado." }
            ].map((tip, idx) => (
              <div 
                key={idx}
                className="rounded-xl border p-2.5 transition-all duration-200"
                style={{ 
                  borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)", 
                  background: "rgba(255,255,255,0.01)" 
                }}
              >
                <p className="text-[10.5px] leading-relaxed text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="text-[12px] shrink-0 mt-0.5">{tip.icon}</span>
                  <span>
                    <strong className="text-white block mb-0.5">{tip.title}</strong>
                    {tip.text}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </SidebarWidget>
      );
      case "cerveceros": return (
        <SidebarWidget 
          label="COMUNIDAD"
          collapsed={collapsedWidgets.includes(id)}
          onClose={() => removeWidget(id)}
          onToggleCollapse={() => toggleCollapse(id)}
        >
          <div className="space-y-1.5 mt-1">
            {["Ragnar", "Lagertha", "Björn", "Floki", "Ivar"].map((name, i) => {
              const medals = ["👑 #1", "🥈 #2", "🥉 #3", "⭐ #4", "⭐ #5"];
              return (
                <motion.div 
                  key={name} 
                  initial={{ opacity: 0, x: 8 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  whileHover={{ x: 3 }} 
                  className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors border border-transparent hover:border-white/[0.04]" 
                  style={{ background: "transparent" }} 
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} 
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div 
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" 
                    style={{ 
                      background: "var(--gradient-button-primary)", 
                      color: "var(--color-text-dark)", 
                      boxShadow: i === 0 ? "0 0 10px rgba(251,191,36,0.3)" : "none" 
                    }}
                  >
                    {name[0]}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold" style={{ color: "var(--color-text-primary)", fontSize: "11.5px" }}>
                      {name}
                    </p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
                      {[12, 9, 7, 6, 5][i]} cervezas · {[48, 35, 22, 18, 14][i]} 🍻
                    </p>
                  </div>
                  
                  <span className="font-bold px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]" style={{ color: i === 0 ? "var(--color-amber-primary)" : "var(--color-text-muted)", fontSize: "10px" }}>
                    {medals[i]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </SidebarWidget>
      );
      default: return null;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

  const toggleLike = async (beerId: string) => {
    if (!user) return;
    const cerveza = cervezas.find((c) => c._id === beerId);
    const liked = cerveza?.likes.includes(user._id);
    try {
      await onToggleLike(beerId);
      setSnackbarMessage(liked ? "Like eliminado ❌" : "¡Saludo vikingo enviado! 🍻");
      setSnackbarColor(liked ? "var(--color-error)" : "var(--color-amber-primary)");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al dar/retirar like:", error);
    }
  };

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;

  if (!mounted) return null;

  return (
    <MainLayout
      maxWidth="calc(1140px + 4rem)"
      topBanner={<PairingBanner beers={cervezas} />}
      sidebar={
        !sidebarDismissed ? (
          <div
            className="flex flex-col gap-3.5 pr-1 max-h-[calc(100vh-8rem)] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(251,191,36,0.18) transparent",
            }}
          >
            {/* Floating header row */}
            <div className="flex items-center justify-between px-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-secondary)" }}>Mis widgets</span>
              <button
                type="button"
                onClick={() => setSidebarDismissed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full border text-sm transition-all hover:bg-white/5"
                style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 75%, white 25%)", background: "rgba(255,255,255,0.04)", color: "var(--color-text-muted)" }}
                aria-label="Cerrar panel"
              >
                ×
              </button>
            </div>

            {/* Selector de widgets (inline) */}
            <AnimatePresence initial={false}>
              {pickerOpen && (
                <motion.div
                  className="relative w-full overflow-hidden"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                >
                  <div
                    className="relative overflow-hidden rounded-[1.75rem]"
                    style={{
                      background: "color-mix(in srgb, var(--color-surface-card) 94%, var(--color-surface-deepest) 6%)",
                      backdropFilter: "blur(22px) saturate(1.2)",
                      WebkitBackdropFilter: "blur(22px) saturate(1.2)",
                      border: "1px solid color-mix(in srgb, var(--color-border-amber) 38%, var(--color-border-light))",
                      boxShadow: "inset 0 1px 0 color-mix(in srgb, white 18%, transparent), var(--shadow-elevated), 0 0 0 1px color-mix(in srgb, var(--color-amber-primary) 8%, transparent)",
                    }}
                  >
                    {/* Inner border */}
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ border: "1px solid color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))" }} aria-hidden="true" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-border-amber) 30%, transparent)" }}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-amber-primary)" }}>Widgets disponibles</p>
                        <p className="text-[9px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>Toca para agregar al panel</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border text-sm hover:bg-white/5"
                        style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "rgba(255,255,255,0.04)", color: "var(--color-text-muted)" }}
                      >
                        ×
                      </button>
                    </div>

                    {/* Available widgets */}
                    <div className="p-3 space-y-2">
                      <AnimatePresence mode="popLayout">
                        {WIDGET_REGISTRY.filter((w) => !enabledWidgets.includes(w.id)).map((w) => (
                          <motion.div
                            key={w.id}
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 26 }}
                            className="flex items-center gap-3 rounded-2xl p-3"
                            style={{
                              background: "color-mix(in srgb, var(--color-surface-card-alt) 60%, transparent)",
                              border: "1px solid color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                            }}
                          >
                            <span className="leading-none" style={{ fontSize: "20px" }}>{w.emoji}</span>
                            <span className="min-w-0 flex-1 font-medium" style={{ color: "var(--color-text-primary)", fontSize: "11px" }}>{w.label}</span>
                            <motion.button
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                              onClick={() => { toggleWidget(w.id); }}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold"
                              style={{ fontSize: "13px", background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                              aria-label={`Agregar ${w.label}`}
                            >
                              +
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {WIDGET_REGISTRY.every((w) => enabledWidgets.includes(w.id)) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                          <span style={{ fontSize: "24px" }}>✨</span>
                          <p className="mt-1 font-medium" style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>Todos los widgets activos</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="pb-3 text-center">
                      <span style={{ color: "var(--color-text-muted)", opacity: 0.45, fontSize: "9px" }}>Los cambios se guardan automáticamente</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Individual widget cards — drag to reorder */}
            <Reorder.Group
              axis="y"
              values={enabledWidgets}
              onReorder={(newOrder) => {
                setEnabledWidgets(newOrder);
                localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newOrder));
              }}
              className="flex flex-col gap-2.5 list-none m-0 p-0"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {enabledWidgets.map((id) => (
                  <Reorder.Item
                    key={id}
                    value={id}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className="relative shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ listStyle: "none" }}
                  >
                    {renderWidget(id)}
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {/* Empty state */}
            {enabledWidgets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-[1.5rem] py-8 text-center shrink-0"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed color-mix(in srgb, var(--color-border-light) 55%, transparent)" }}
              >
                <span style={{ fontSize: "30px" }}>🍺</span>
                <p className="mt-2 font-medium" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Sin widgets activos</p>
              </motion.div>
            )}

            {/* Agregar widget button */}
            {WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPickerOpen((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] border py-2.5 font-semibold transition-all shrink-0"
                style={{
                  fontSize: "11px",
                  borderColor: pickerOpen
                    ? "var(--color-amber-primary)"
                    : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                  color: pickerOpen
                    ? "var(--color-amber-primary)"
                    : "var(--color-text-secondary)",
                  background: pickerOpen
                    ? "rgba(251,191,36,0.08)"
                    : "rgba(251,191,36,0.03)",
                }}
                aria-label="Agregar widget"
              >
                <span className="leading-none" style={{ fontSize: "16px" }}>{pickerOpen ? "−" : "+"}</span>
                Agregar widget
              </motion.button>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="relative z-[2] mx-auto w-full max-w-[30.375rem] xl:max-w-none flex-1 pb-12">
        {/* ─── Header ─── */}
        <motion.div initial="hidden" animate="visible" className="mb-8 border-b pb-6" style={{ borderColor: "var(--color-border-subtle)" }}>
          {/* Top row: eyebrow + Subir Cerveza */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block rounded-full border px-4 py-1.5 font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
              style={{
                fontSize: "11px",
                borderColor: "var(--color-border-amber)",
                color: "var(--color-amber-primary)",
                background: "rgba(251,191,36,0.06)",
              }}
            >
              🍺 Catálogo Lúpulos
            </motion.span>

            {user && (
              <motion.div variants={fadeUp} custom={4} className="shrink-0">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setModalOpen(true)}
                  className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Subir Cerveza
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.button>
              </motion.div>
            )}
          </div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-heading font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            Explora{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 20%, var(--color-amber-hover) 40%, var(--color-amber-primary) 60%, var(--color-amber-light) 80%, var(--color-amber-primary) 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "magic-gradient-shift 4s ease-in-out infinite",
              }}
            >
              cervezas únicas
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-xl text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Descubre, califica y comparte las mejores cervezas artesanales de la comunidad
          </motion.p>

          {/* Stats chips */}
          {cervezas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              {[
                { icon: "🍺", value: cervezas.length, label: `cerveza${cervezas.length !== 1 ? "s" : ""}` },
                { icon: "⭐", value: cervezas.filter((b) => (b.averageRating ?? 0) >= 4).length, label: "top rated" },
                { icon: "🍻", value: cervezas.reduce((s, b) => s + b.likes.length, 0), label: "brindis" },
              ].map((stat, i) => (
                <motion.span
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.08, type: "spring", stiffness: 320, damping: 22 }}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold backdrop-blur-sm"
                  style={{
                    fontSize: "11px",
                    borderColor: "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                    background: "rgba(251,191,36,0.05)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span>{stat.icon}</span>
                  <span style={{ color: "var(--color-amber-primary)", fontVariantNumeric: "tabular-nums" }}>{stat.value}</span>
                  <span>{stat.label}</span>
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ─── Toolbar: AI Sommelier search + filtros ─── */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.div variants={fadeUp} custom={3} className="w-full">
            <GradientBorder active={searchFocused} radius={28} borderWidth={1.5}>
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-3 rounded-[26.5px] px-5 py-3.5"
                style={{ background: "var(--color-surface-card)" }}
              >
                <MagicSearchIcon active={searchFocused} />
                <div className="relative flex-1">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full bg-transparent text-sm outline-none"
                    style={{ color: "var(--color-text-primary)" }}
                  />
                  {/* Typewriter placeholder — only when input is empty */}
                  {!searchQuery && (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <span>{typedPlaceholder}</span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                        className="ml-px inline-block h-4 w-[2px] rounded-full"
                        style={{ background: "var(--color-amber-primary)" }}
                      />
                    </div>
                  )}
                </div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveQuery("");
                    }}
                    className="transition-colors"
                    style={{ fontSize: "12px", color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                ) : (
                  <kbd
                    className="hidden select-none rounded border px-1.5 py-0.5 font-semibold sm:block"
                    style={{ fontSize: "9px", borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", color: "var(--color-text-muted)", background: "rgba(255,255,255,0.04)" }}
                  >
                    /
                  </kbd>
                )}
              </form>
            </GradientBorder>

            {/* Quick suggestion chips */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0"
            >
              <motion.button
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery("");
                  setActiveQuery("");
                }}
                className="flex-shrink-0 rounded-full border px-3 py-1 font-medium backdrop-blur-sm transition-all"
                style={
                  activeQuery === ""
                    ? {
                        fontSize: "11px",
                        borderColor: "color-mix(in srgb, var(--color-amber-primary) 55%, transparent)",
                        background: "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)",
                        color: "var(--color-amber-primary)",
                      }
                    : {
                        fontSize: "11px",
                        borderColor: "var(--color-border-light)",
                        color: "var(--color-text-secondary)",
                        background: "rgba(251,191,36,0.04)",
                      }
                }
              >
                Todas
              </motion.button>
              {QUICK_SUGGESTIONS.map((s) => {
                const isActive = activeQuery === s.query;
                return (
                  <motion.button
                    key={s.query}
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchQuery(s.query);
                      setActiveQuery(s.query);
                    }}
                    className="flex-shrink-0 rounded-full border px-3 py-1 font-medium backdrop-blur-sm transition-all"
                    style={
                      isActive
                        ? {
                            fontSize: "11px",
                            borderColor: "color-mix(in srgb, var(--color-amber-primary) 55%, transparent)",
                            background: "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)",
                            color: "var(--color-amber-primary)",
                          }
                        : {
                            fontSize: "11px",
                            borderColor: "var(--color-border-light)",
                            color: "var(--color-text-secondary)",
                            background: "rgba(251,191,36,0.04)",
                          }
                    }
                  >
                    {s.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ─── Mobile Widgets (xl:hidden) ─── */}
        <div className="mb-6 xl:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-secondary)", fontSize: "10px" }}>Mis widgets</span>
            {WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setPickerOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold transition-all"
                style={{
                  fontSize: "11px",
                  borderColor: pickerOpen ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                  color: pickerOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  background: pickerOpen ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.03)",
                }}
              >
                <span className="leading-none" style={{ fontSize: "14px" }}>{pickerOpen ? "−" : "+"}</span>
                Agregar
              </motion.button>
            )}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {enabledWidgets.map((id) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="group/widget-m relative mb-2.5 overflow-hidden rounded-[1.5rem]"
                style={{
                  background: "color-mix(in srgb, var(--color-surface-card) 92%, var(--color-surface-deepest) 8%)",
                  backdropFilter: "blur(18px) saturate(1.15)",
                  WebkitBackdropFilter: "blur(18px) saturate(1.15)",
                  border: "1px solid color-mix(in srgb, var(--color-border-light) 88%, white 12%)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, white 16%, transparent), var(--shadow-elevated)",
                }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ border: "1px solid color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))" }} aria-hidden="true" />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => toggleWidget(id)}
                  className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border opacity-0 group-hover/widget-m:opacity-100 transition-opacity"
                  style={{ fontSize: "11px", borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "color-mix(in srgb, var(--color-surface-card) 90%, transparent)", color: "var(--color-text-muted)" }}
                  aria-label="Quitar widget"
                >
                  −
                </motion.button>
                {renderWidget(id)}
              </motion.div>
            ))}
          </AnimatePresence>

          {enabledWidgets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-[1.5rem] py-8 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed color-mix(in srgb, var(--color-border-light) 55%, transparent)" }}
            >
              <span style={{ fontSize: "30px" }}>🍺</span>
              <p className="mt-2 font-medium" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Sin widgets activos</p>
              <p className="mt-0.5" style={{ color: "var(--color-text-muted)", opacity: 0.6, fontSize: "10px" }}>Toca + Agregar para personalizar</p>
            </motion.div>
          )}
        </div>

        {/* ─── Content: Grid ─── */}
        <div>
          {/* Beer grid */}
          <div className="min-w-0">
            {isLoading ? (
              <div
                className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[1.75rem] border px-6 py-10 text-center"
                style={{
                  background: "color-mix(in srgb, var(--color-surface-card) 72%, transparent)",
                  borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                }}
              >
                <CircularProgress
                  size={30}
                  sx={{ color: "var(--color-amber-primary)" }}
                  aria-label="Cargando cervezas"
                />
                <p className="font-semibold" style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
                  Cargando cervezas...
                </p>
                <p className="max-w-sm" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                  Estamos sirviendo el listado para ti.
                </p>
              </div>
            ) : cervezas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center pt-4 pb-12 text-center"
              >
                <motion.span
                  style={{ fontSize: "72px" }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🍺
                </motion.span>
                <h3 className="mt-6 font-bold" style={{ color: "var(--color-text-primary)", fontSize: "20px" }}>
                  {activeQuery
                    ? "No encontramos cervezas con esa búsqueda"
                    : "Aún no hay cervezas publicadas"}
                </h3>
                <p className="mt-2 max-w-sm" style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                  {activeQuery
                    ? "Intenta con otro nombre, estilo o cervecería"
                    : "¡Sé el primero en compartir tu cerveza favorita con la comunidad!"}
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={activeQuery || "__all__"}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-5 xl:grid-cols-2"
                >
                  {cervezas.map((beer: Beer) => {
                    const liked = user ? beer.likes.includes(user._id) : false;
                    return (
                      <BeerCard
                        key={beer._id}
                        beer={beer}
                        userHasLiked={liked}
                        onLike={() => toggleLike(beer._id)}
                        onClick={() => router.push(`/cervezas/${beer._id}`)}
                      />
                    );
                  })}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                  style={{ color: "var(--color-text-muted)", fontSize: "12px" }}
                >
                  {cervezas.length} cerveza{cervezas.length !== 1 ? "s" : ""} encontrada
                  {cervezas.length !== 1 ? "s" : ""}
                  {activeQuery && (
                    <>
                      {" "}para &ldquo;<strong>{activeQuery}</strong>&rdquo;
                    </>
                  )}
                </motion.p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ─── Mobile Picker Bottom Sheet (xl:hidden) — fuera de main para que fixed funcione ─── */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
              onClick={() => setPickerOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[2rem]"
              style={{
                background: "color-mix(in srgb, var(--color-surface-card) 97%, var(--color-surface-deepest) 3%)",
                backdropFilter: "blur(24px) saturate(1.2)",
                WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                border: "1px solid color-mix(in srgb, var(--color-border-amber) 35%, var(--color-border-light))",
                borderBottom: "none",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.4), inset 0 1px 0 color-mix(in srgb, white 14%, transparent)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {/* Handle */}
              <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-2" style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-border-amber) 30%, transparent)" }}>
                <div>
                  <p className="font-bold" style={{ color: "var(--color-amber-primary)", fontSize: "13px" }}>Widgets disponibles</p>
                  <p className="mt-0.5" style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Toca + para agregar al panel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border"
                  style={{ fontSize: "16px", borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)" }}
                >
                  ×
                </button>
              </div>

              {/* Widget list */}
              <div className="max-h-[40vh] overflow-y-auto p-4 space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {WIDGET_REGISTRY.filter((w) => !enabledWidgets.includes(w.id)).map((w) => (
                    <motion.div
                      key={w.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="flex items-center gap-4 rounded-2xl p-4"
                      style={{
                        background: "color-mix(in srgb, var(--color-surface-card-alt) 65%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                      }}
                    >
                      <span className="leading-none" style={{ fontSize: "24px" }}>{w.emoji}</span>
                      <span className="min-w-0 flex-1 font-medium" style={{ color: "var(--color-text-primary)", fontSize: "13px" }}>{w.label}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleWidget(w.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold"
                        style={{ fontSize: "18px", background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                        aria-label={`Agregar ${w.label}`}
                      >
                        +
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {WIDGET_REGISTRY.every((w) => enabledWidgets.includes(w.id)) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                    <span className="text-3xl">✨</span>
                    <p className="mt-2 text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>Todos los widgets activos</p>
                  </motion.div>
                )}
              </div>

              <div className="pb-6 pt-2 text-center">
                <span className="text-[10px]" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>Los cambios se guardan automáticamente</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <BeerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refreshBeers();
        }}
        usuario={user}
      />

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={slideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert
          severity="success"
          sx={{
            bgcolor: snackbarColor,
            color: "var(--color-text-dark)",
            borderRadius: "12px",
            fontWeight: 500,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
