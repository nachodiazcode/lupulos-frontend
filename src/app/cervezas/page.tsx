"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
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

  const typedPlaceholder = useTypewriter(SOMMELIER_HINTS);
  const { beers: cervezas, isLoading, refreshBeers, onToggleLike } = useBeers(activeQuery);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

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

      <main className="relative z-[2] mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-12 sm:px-6">
        {/* ─── Header ─── */}
        <motion.div initial="hidden" animate="visible" className="mb-10 flex flex-col items-center text-center">
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
            Catálogo cervecero
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
                {searchQuery && (
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
                )}
              </form>
            </GradientBorder>

            {/* Quick suggestion chips */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-3 flex flex-wrap justify-center gap-2"
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
                  className="rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-sm transition-all"
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

        {/* ─── Content: Grid + Sidebar ─── */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Beer grid (2/3) */}
          <div className="flex-1 min-w-0">
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

          {/* ─── Sidebar (1/3) ─── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden w-72 shrink-0 space-y-5 lg:block"
          >
            {/* 🌤️ Sugerencia según clima */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Decorative warm glow */}
              <div
                className="absolute -top-6 -left-6 h-20 w-20 rounded-full opacity-15"
                style={{ background: "var(--color-amber-primary)", filter: "blur(20px)" }}
              />
              <h4
                className="relative mb-3 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 10, -5, 0], y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                >
                  ☀️
                </motion.span>
                Cerveza del día
              </h4>
              <p className="relative text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Hoy hace calor — te recomendamos una
              </p>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative mt-3 flex items-center gap-3 rounded-xl p-3"
                style={{ background: "rgba(251,191,36,0.06)" }}
              >
                <span className="text-2xl">🍻</span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Lager Refrescante
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    Suave, crisp, perfecta para el verano
                  </p>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSearchQuery("Lager");
                  setActiveQuery("Lager");
                }}
                className="relative mt-3 w-full rounded-xl py-2 text-[12px] font-semibold transition-all"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                Buscar Lagers →
              </motion.button>
            </motion.div>

            {/* Cerveceros destacados */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="overflow-hidden rounded-2xl border backdrop-blur-sm p-5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h4
                className="mb-4 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  ⭐
                </motion.span>
                Cerveceros destacados
              </h4>
              <div className="space-y-2">
                {["Ragnar", "Lagertha", "Björn", "Floki", "Ivar"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    whileHover={{ x: 3 }}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <motion.div
                      whileHover={{ rotate: 8 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: "var(--gradient-button-primary)",
                        color: "var(--color-text-dark)",
                        boxShadow: i === 0 ? "0 0 10px rgba(251,191,36,0.3)" : "none",
                      }}
                    >
                      {name[0]}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-[13px] font-medium transition-colors group-hover:text-amber-primary"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {name}
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                        {[12, 9, 7, 6, 5][i]} cervezas · {[48, 35, 22, 18, 14][i]} 🍻
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold" style={{ color: "var(--color-amber-primary)" }}>
                        #{i + 1}
                      </span>
                      {i === 0 && (
                        <motion.span
                          className="text-[9px]"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          👑
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 📊 Encuesta */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h4
                className="mb-3 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  📊
                </motion.span>
                Encuesta de la semana
              </h4>
              <p className="mb-3 text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
                ¿Qué estilo de cerveza prefieres para el fin de semana?
              </p>
              <div className="space-y-2">
                {[
                  { label: "IPA bien lupulada", emoji: "🌿", pct: 38 },
                  { label: "Stout cremosa", emoji: "☕", pct: 27 },
                  { label: "Lager clásica", emoji: "🥂", pct: 22 },
                  { label: "Sour frutal", emoji: "🍊", pct: 13 },
                ].map((opt) => {
                  const voted = pollVote !== null;
                  const isSelected = pollVote === opt.label;
                  return (
                    <motion.button
                      key={opt.label}
                      whileHover={!voted ? { scale: 1.02 } : {}}
                      whileTap={!voted ? { scale: 0.98 } : {}}
                      onClick={() => !voted && setPollVote(opt.label)}
                      className="relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all"
                      style={{
                        borderColor: isSelected
                          ? "var(--color-amber-primary)"
                          : "var(--color-border-light)",
                        cursor: voted ? "default" : "pointer",
                      }}
                    >
                      {/* Progress bar fill */}
                      {voted && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${opt.pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 rounded-xl"
                          style={{
                            background: isSelected
                              ? "rgba(251,191,36,0.15)"
                              : "rgba(251,191,36,0.06)",
                          }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span
                          className="flex items-center gap-2 text-[13px] font-medium"
                          style={{
                            color: isSelected
                              ? "var(--color-amber-primary)"
                              : "var(--color-text-primary)",
                          }}
                        >
                          <span>{opt.emoji}</span>
                          {opt.label}
                        </span>
                        {voted && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[12px] font-bold"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {opt.pct}%
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {pollVote && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center text-[12px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  ¡Gracias por votar! 🎉 127 votos totales
                </motion.p>
              )}
            </motion.div>

            {/* Explorar por estilo */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="rounded-2xl border backdrop-blur-sm p-5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h4
                className="mb-3 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🍺
                </motion.span>
                Explorar por estilo
              </h4>
              <div className="flex flex-wrap gap-2">
                {["IPA", "Stout", "Lager", "Porter", "Wheat", "Pale Ale", "Sour", "Amber"].map(
                  (style, i) => (
                    <motion.button
                      key={style}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setSearchQuery(style);
                        setActiveQuery(style);
                      }}
                      className="rounded-full border px-3 py-1.5 text-[12px] font-medium backdrop-blur-sm transition-all"
                      style={{
                        borderColor: activeQuery === style ? "var(--color-amber-primary)" : "var(--color-border-light)",
                        color: activeQuery === style ? "var(--color-amber-primary)" : "var(--color-text-primary)",
                        background: activeQuery === style ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)",
                      }}
                    >
                      {style}
                    </motion.button>
                  ),
                )}
              </div>
            </motion.div>

            {/* Tips cerveceros */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Decorative blurred circle */}
              <div
                className="absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-20"
                style={{
                  background: "var(--color-amber-primary)",
                  filter: "blur(16px)",
                }}
              />
              <h4
                className="relative mb-3 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 20, -10, 0], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                >
                  💡
                </motion.span>
                ¿Sabías que...?
              </h4>
              <p className="relative text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Las IPAs deben su amargor al lúpulo, una planta trepadora que también actúa como
                conservante natural. ¡Por eso los marineros ingleses las llevaban a la India!
              </p>
              <div
                className="relative mt-3 h-px w-full"
                style={{ background: "var(--color-border-subtle)" }}
              />
              <p
                className="relative mt-3 text-[13px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                La temperatura ideal para servir una Stout es entre 10°C y 13°C. Demasiado fría
                oculta sus notas de chocolate y café. ☕
              </p>
            </motion.div>
          </motion.aside>
        </div>
      </main>

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
