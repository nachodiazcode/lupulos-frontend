"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  Reorder,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
  type Variants,
} from "framer-motion";
import { Snackbar, Alert, Rating } from "@mui/material";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import BeerFormModal from "@/features/beers/components/BeerFormModal";
import PairingBanner from "@/components/PairingBanner";
import { getImageUrl } from "@/lib/constants";
import { useBeers } from "@/features/beers/hooks/useBeers";
import type { Beer } from "@/features/beers/model/types";

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

const cardPop: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 22 },
  },
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
   Skeleton Card
   ═══════════════════════════════════ */

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div className="aspect-[5/3]" style={{ background: "var(--color-surface-card-alt)" }} />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded" style={{ background: "var(--color-border-light)" }} />
        <div className="h-4 w-1/2 rounded" style={{ background: "var(--color-border-subtle)" }} />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full"
              style={{ background: "var(--color-border-subtle)" }}
            />
          ))}
        </div>
        <div className="h-3 w-2/3 rounded" style={{ background: "var(--color-border-subtle)" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Beer Card
   ═══════════════════════════════════ */

function BeerCard({
  beer,
  userHasLiked,
  onLike,
  onClick,
}: {
  beer: Beer;
  userHasLiked: boolean;
  onLike: () => void;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={cardPop}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Shimmer sweep on hover */}
      <span
        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />

      {/* Image */}
      <div
        className="relative aspect-[5/3] overflow-hidden"
        style={{ background: "var(--color-surface-card-alt)" }}
      >
        {beer.image && !imgError ? (
          <Image
            src={getImageUrl(beer.image)}
            alt={beer.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl select-none">🍺</div>
        )}

        {/* Gradient overlay on image */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Like button overlay */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          whileHover={{ scale: 1.25, rotate: 8 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
          style={{
            background: userHasLiked ? "rgba(251,191,36,0.3)" : "rgba(0,0,0,0.4)",
            boxShadow: userHasLiked ? "0 0 12px rgba(251,191,36,0.3)" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={userHasLiked ? "liked" : "not"}
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="text-base leading-none"
            >
              {userHasLiked ? "🍻" : "🤍"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* ABV badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
          style={{
            background: "var(--gradient-button-primary)",
            color: "var(--color-text-dark)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {beer.abv}% ABV
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="truncate text-lg font-bold tracking-tight transition-colors duration-200"
          style={{ color: "var(--color-text-primary)" }}
        >
          {beer.name}
        </h3>

        {/* Style + brewery */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-200 group-hover:border-amber-primary/50"
            style={{
              borderColor: "var(--color-border-amber)",
              color: "var(--color-amber-primary)",
              background: "rgba(251,191,36,0.06)",
            }}
          >
            {beer.style}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {beer.brewery}
          </span>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <Rating
            value={beer.averageRating || 0}
            precision={0.5}
            readOnly
            size="small"
            sx={{
              "& .MuiRating-iconFilled": { color: "var(--color-amber-primary)" },
              "& .MuiRating-iconEmpty": { color: "var(--color-border-medium)" },
            }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-amber-primary)" }}
          >
            {beer.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>

        {/* Footer */}
        <div
          className="mt-3 flex items-center justify-between text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>
            Por{" "}
            <strong style={{ color: "var(--color-text-secondary)" }}>
              {beer.createdBy?.username ?? "—"}
            </strong>
          </span>
          <span style={{ color: "var(--color-amber-primary)" }}>🍻 {beer.likes.length}</span>
        </div>
      </div>

      {/* Bottom accent on hover */}
      <div
        className="h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background:
            "linear-gradient(90deg, var(--color-amber-primary), var(--color-amber-dark), transparent)",
        }}
      />
    </motion.div>
  );
}

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
  const [pickerOpen, setPickerOpen] = useState(false);

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
  }, []);

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

  const renderWidget = (id: WidgetId): React.ReactNode => {
    switch (id) {
      case "cerveza-del-dia": return (
        <div className="px-5 pt-3 pb-3">
          <div className="mb-2.5 flex items-center gap-2">
            <motion.span className="text-sm" animate={{ rotate: [0, 10, -5, 0], y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}>☀️</motion.span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Cerveza del día</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Hoy hace calor — te recomendamos una</p>
          <div className="mt-2.5 flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: "rgba(251,191,36,0.06)" }}>
            <span className="text-xl">🍻</span>
            <div>
              <p className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>Lager Refrescante</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Suave, crisp, perfecta para el verano</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setSearchQuery("Lager"); setActiveQuery("Lager"); }} className="mt-2.5 w-full rounded-xl py-1.5 text-[11px] font-semibold transition-all" style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}>
            Buscar Lagers →
          </motion.button>
        </div>
      );
      case "encuesta": return (
        <div className="px-5 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <motion.span className="text-sm" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>📊</motion.span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Encuesta</span>
          </div>
          <p className="mb-2 text-[12px] font-medium" style={{ color: "var(--color-text-secondary)" }}>¿Qué estilo prefieres para el fin de semana?</p>
          <div className="space-y-1.5">
            {[{ label: "IPA bien lupulada", emoji: "🌿", pct: 38 }, { label: "Stout cremosa", emoji: "☕", pct: 27 }, { label: "Lager clásica", emoji: "🥂", pct: 22 }, { label: "Sour frutal", emoji: "🍊", pct: 13 }].map((opt) => {
              const voted = pollVote !== null;
              const isSelected = pollVote === opt.label;
              return (
                <motion.button key={opt.label} whileHover={!voted ? { scale: 1.02 } : {}} whileTap={!voted ? { scale: 0.98 } : {}} onClick={() => !voted && setPollVote(opt.label)} className="relative w-full overflow-hidden rounded-xl border px-2.5 py-2 text-left transition-all" style={{ borderColor: isSelected ? "var(--color-amber-primary)" : "var(--color-border-light)", cursor: voted ? "default" : "pointer" }}>
                  {voted && <motion.div initial={{ width: 0 }} animate={{ width: `${opt.pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute inset-y-0 left-0 rounded-xl" style={{ background: isSelected ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.06)" }} />}
                  <div className="relative flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: isSelected ? "var(--color-amber-primary)" : "var(--color-text-primary)" }}><span>{opt.emoji}</span>{opt.label}</span>
                    {voted && <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-[11px] font-bold" style={{ color: "var(--color-text-secondary)" }}>{opt.pct}%</motion.span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
          {pollVote && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-center text-[11px]" style={{ color: "var(--color-text-secondary)" }}>¡Gracias por votar! 🎉 127 votos totales</motion.p>}
        </div>
      );
      case "explorar-estilo": return (
        <div className="px-5 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <motion.span className="text-sm" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>🍺</motion.span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Explorar por estilo</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["IPA", "Stout", "Lager", "Porter", "Wheat", "Pale Ale", "Sour", "Amber"].map((style, i) => (
              <motion.button key={style} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.92 }} onClick={() => { setSearchQuery(style); setActiveQuery(style); }} className="rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition-all" style={{ borderColor: activeQuery === style ? "var(--color-amber-primary)" : "var(--color-border-light)", color: activeQuery === style ? "var(--color-amber-primary)" : "var(--color-text-primary)", background: activeQuery === style ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)" }}>
                {style}
              </motion.button>
            ))}
          </div>
        </div>
      );
      case "tips": return (
        <div className="px-5 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <motion.span className="text-sm" animate={{ rotate: [0, 20, -10, 0], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}>💡</motion.span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>¿Sabías que...?</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Las IPAs deben su amargor al lúpulo, una planta trepadora que también actúa como conservante natural. ¡Por eso los marineros ingleses las llevaban a la India!</p>
          <div className="my-2.5 h-px w-full" style={{ background: "var(--color-border-subtle)" }} />
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>La temperatura ideal para servir una Stout es entre 10°C y 13°C. Demasiado fría oculta sus notas de chocolate y café. ☕</p>
        </div>
      );
      case "cerveceros": return (
        <div className="px-5 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <motion.span className="text-sm" animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>⭐</motion.span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Cerveceros destacados</span>
          </div>
          <div className="space-y-1.5">
            {["Ragnar", "Lagertha", "Björn", "Floki", "Ivar"].map((name, i) => (
              <motion.div key={name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ x: 3 }} className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors" style={{ background: "transparent" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.06)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: i === 0 ? "0 0 8px rgba(251,191,36,0.3)" : "none" }}>{name[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium" style={{ color: "var(--color-text-primary)" }}>{name}</p>
                  <p className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>{[12, 9, 7, 6, 5][i]} cervezas · {[48, 35, 22, 18, 14][i]} 🍻</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: "var(--color-amber-primary)" }}>#{i + 1}{i === 0 ? " 👑" : ""}</span>
              </motion.div>
            ))}
          </div>
        </div>
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
    <div className="relative flex min-h-screen flex-col" style={{ color: "var(--color-text-primary)" }}>
      <GoldenBackground />
      <Navbar />
      <PairingBanner beers={cervezas} />

      <main className="relative z-[2] mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-12 sm:px-6">
        {/* ─── Header ─── */}
        <motion.div initial="hidden" animate="visible" className="mb-6 flex flex-col items-center text-center sm:mb-10">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
            style={{
              borderColor: "var(--color-border-amber)",
              color: "var(--color-amber-primary)",
              background: "rgba(251,191,36,0.06)",
            }}
          >
            🍺 Catálogo Lúpulos
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
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
            className="mt-3 max-w-lg text-sm sm:text-base"
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
              className="mt-4 flex flex-wrap justify-center gap-2"
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
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
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

          {/* AI Sommelier Search */}
          <motion.div variants={fadeUp} custom={3} className="mt-8 w-full max-w-xl">
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
                    className="text-xs transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                ) : (
                  <kbd
                    className="hidden select-none rounded border px-1.5 py-0.5 text-[9px] font-semibold sm:block"
                    style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", color: "var(--color-text-muted)", background: "rgba(255,255,255,0.04)" }}
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
              className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0"
            >
              {QUICK_SUGGESTIONS.map((s) => (
                <motion.button
                  key={s.query}
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery(s.query);
                    setActiveQuery(s.query);
                  }}
                  className="flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-sm transition-all"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-text-secondary)",
                    background: "rgba(251,191,36,0.04)",
                  }}
                >
                  {s.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Upload CTA */}
          {user && (
            <motion.div variants={fadeUp} custom={4} className="mt-5">
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
        </motion.div>

        {/* ─── Mobile Widgets (xl:hidden) ─── */}
        <div className="mb-6 xl:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-secondary)" }}>Mis widgets</span>
            {WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setPickerOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  borderColor: pickerOpen ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                  color: pickerOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  background: pickerOpen ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.03)",
                }}
              >
                <span className="text-sm leading-none">{pickerOpen ? "−" : "+"}</span>
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
                  className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] opacity-0 group-hover/widget-m:opacity-100 transition-opacity"
                  style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "color-mix(in srgb, var(--color-surface-card) 90%, transparent)", color: "var(--color-text-muted)" }}
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
              <span className="text-3xl">🍺</span>
              <p className="mt-2 text-[12px] font-medium" style={{ color: "var(--color-text-muted)" }}>Sin widgets activos</p>
              <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>Toca + Agregar para personalizar</p>
            </motion.div>
          )}
        </div>

        {/* ─── Content: Grid ─── */}
        <div>
          {/* Beer grid */}
          <div className="min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : cervezas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-20 text-center"
              >
                <motion.span
                  className="text-7xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🍺
                </motion.span>
                <h3 className="mt-6 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {activeQuery
                    ? "No encontramos cervezas con esa búsqueda"
                    : "Aún no hay cervezas publicadas"}
                </h3>
                <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {activeQuery
                    ? "Intenta con otro nombre, estilo o cervecería"
                    : "¡Sé el primero en compartir tu cerveza favorita con la comunidad!"}
                </p>
                {user && !activeQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setModalOpen(true)}
                    className="mt-6 rounded-full px-6 py-2.5 text-sm font-bold transition-all"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                      boxShadow: "var(--shadow-amber-glow)",
                    }}
                  >
                    Subir la primera cerveza 🚀
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={activeQuery || "__all__"}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2"
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
                  className="mt-6 text-center text-xs"
                  style={{ color: "var(--color-text-muted)" }}
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

      </main>

        {/* ─── Fixed Sidebar Widget ─── */}
        <AnimatePresence>
          {!sidebarDismissed && (
            <motion.aside
              className="fixed z-40 hidden xl:flex flex-col"
              style={{ top: 120, right: 16, width: 256, bottom: 16 }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.3 }}
            >
              {/* Widget cards column */}
              <div className="flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden flex-1 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(251,191,36,0.2) transparent" }}>

                {/* Floating header row */}
                <div className="flex items-center justify-between px-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-secondary)" }}>Mis widgets</span>
                  <button
                    type="button"
                    onClick={() => setSidebarDismissed(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-sm transition-all"
                    style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 75%, white 25%)", background: "rgba(255,255,255,0.04)", color: "var(--color-text-muted)" }}
                    aria-label="Cerrar panel"
                  >
                    ×
                  </button>
                </div>

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
                      className="group/widget relative overflow-hidden rounded-[1.5rem] cursor-grab active:cursor-grabbing"
                      style={{
                        background: "color-mix(in srgb, var(--color-surface-card) 92%, var(--color-surface-deepest) 8%)",
                        backdropFilter: "blur(18px) saturate(1.15)",
                        WebkitBackdropFilter: "blur(18px) saturate(1.15)",
                        border: "1px solid color-mix(in srgb, var(--color-border-light) 88%, white 12%)",
                        boxShadow: "inset 0 1px 0 color-mix(in srgb, white 16%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--color-amber-primary) 6%, transparent), var(--shadow-elevated)",
                        listStyle: "none",
                      }}
                    >
                      {/* Inner border */}
                      <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ border: "1px solid color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))" }} aria-hidden="true" />
                      {/* Bottom rim */}
                      <div className="pointer-events-none absolute inset-x-5 bottom-[1px] h-px" style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-light) 40%, transparent), transparent)", opacity: 0.6 }} aria-hidden="true" />

                      {/* Remove button — visible on hover */}
                      <motion.button
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                        onClick={() => toggleWidget(id)}
                        className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] opacity-0 group-hover/widget:opacity-100 transition-opacity duration-150"
                        style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "color-mix(in srgb, var(--color-surface-card) 90%, transparent)", color: "var(--color-text-muted)", backdropFilter: "blur(8px)" }}
                        aria-label="Quitar widget"
                      >
                        −
                      </motion.button>

                      {renderWidget(id)}
                    </Reorder.Item>
                  ))}
                  </AnimatePresence>
                </Reorder.Group>

                {/* Empty state */}
                {enabledWidgets.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-[1.5rem] py-8 text-center"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed color-mix(in srgb, var(--color-border-light) 55%, transparent)" }}
                  >
                    <span className="text-3xl">🍺</span>
                    <p className="mt-2 text-[12px] font-medium" style={{ color: "var(--color-text-muted)" }}>Sin widgets activos</p>
                  </motion.div>
                )}

                {/* Agregar widget button */}
                {WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setPickerOpen((v) => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-[11px] font-semibold transition-all"
                    style={{
                      borderColor: pickerOpen ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                      color: pickerOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                      background: pickerOpen ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.03)",
                    }}
                  >
                    <span className="text-base leading-none">{pickerOpen ? "−" : "+"}</span>
                    Agregar widget
                    <kbd
                      className="ml-auto rounded border px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{ borderColor: "color-mix(in srgb, var(--color-border-amber) 45%, transparent)", color: "var(--color-text-muted)", background: "rgba(255,255,255,0.03)" }}
                    >
                      ⌘K
                    </kbd>
                  </motion.button>
                )}

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── Widget Picker Card ─── */}
        <AnimatePresence>
          {!sidebarDismissed && pickerOpen && (
            <motion.div
              className="fixed z-[60] hidden xl:block"
              style={{ top: 120, right: 280, width: 248 }}
              initial={{ opacity: 0, x: -16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
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
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-sm"
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
                        <span className="text-xl leading-none">{w.emoji}</span>
                        <span className="min-w-0 flex-1 text-[11px] font-medium" style={{ color: "var(--color-text-primary)" }}>{w.label}</span>
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                          onClick={() => { toggleWidget(w.id); }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                          style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                          aria-label={`Agregar ${w.label}`}
                        >
                          +
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {WIDGET_REGISTRY.every((w) => enabledWidgets.includes(w.id)) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                      <span className="text-2xl">✨</span>
                      <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--color-text-secondary)" }}>Todos los widgets activos</p>
                    </motion.div>
                  )}
                </div>

                <div className="pb-3 text-center">
                  <span className="text-[9px]" style={{ color: "var(--color-text-muted)", opacity: 0.45 }}>Los cambios se guardan automáticamente</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <p className="text-[13px] font-bold" style={{ color: "var(--color-amber-primary)" }}>Widgets disponibles</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>Toca + para agregar al panel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-base"
                  style={{ borderColor: "color-mix(in srgb, var(--color-border-subtle) 80%, white 20%)", background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)" }}
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
                      <span className="text-2xl leading-none">{w.emoji}</span>
                      <span className="min-w-0 flex-1 text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{w.label}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleWidget(w.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                        style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
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
    </div>
  );
}
