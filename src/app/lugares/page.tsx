"use client";
import Image from "next/image";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
  type Variants,
} from "framer-motion";
import { Rating, Snackbar, Alert } from "@mui/material";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";
import { api } from "@/lib/api";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import MapView from "@/features/lugares/components/MapView";
import PlaceDiscoveryGrid from "@/features/lugares/components/PlaceDiscoveryGrid";
import PlaceFormModal from "@/features/lugares/components/LugarFormModal";
import type { Place } from "@/features/lugares/types";
import { getImageUrl } from "@/lib/constants";

/* ─── Animations ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

/* ═══════════════════════════════════
   Gradient Border (same as cervezas)
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
    const ctrl = fmAnimate(rotation, 360, { duration: 4, repeat: Infinity, ease: "linear" });
    return () => ctrl.stop();
  }, [rotation]);

  const background = useTransform(
    rotation,
    (r) => `conic-gradient(from ${r}deg, #f59e0b, #ef4444, #f59e0b, #34d399, #f59e0b)`,
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
   Magic Map Icon — lupa ⇆ pin loop
   ═══════════════════════════════════ */
const PIN_SPARKLE_COLORS = ["#f59e0b", "#ef4444", "#f97316", "#fbbf24"];

function MagicMapIcon({ active = false }: { active?: boolean }) {
  const [showPin, setShowPin] = useState(false);

  /* Alternate between lupa and pin every 3s */
  useEffect(() => {
    const interval = setInterval(() => setShowPin((p) => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
      {/* Orbiting sparkles — only when focused */}
      {PIN_SPARKLE_COLORS.map((color, i) => (
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
              ? { duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }
              : { duration: 0.2 }
          }
        />
      ))}

      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          active
            ? {
                boxShadow: [
                  "0 0 0px 0px rgba(249,115,22,0)",
                  "0 0 12px 3px rgba(249,115,22,0.35)",
                  "0 0 0px 0px rgba(249,115,22,0)",
                ],
              }
            : { boxShadow: "0 0 0px 0px rgba(249,115,22,0)" }
        }
        transition={active ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      />

      {/* Icon swap: lupa ⇆ pin */}
      <AnimatePresence mode="wait">
        {showPin ? (
          <motion.svg
            key="pin"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute top-1/2 left-1/2"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <defs>
              <linearGradient id="pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="url(#pin-grad)"
            />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </motion.svg>
        ) : (
          <motion.svg
            key="lupa"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute top-1/2 left-1/2"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ scale: 0.4, opacity: 0, rotate: 90 }}
            animate={
              active
                ? { scale: 1, opacity: 1, rotate: [0, -10, 10, -5, 0] }
                : { scale: 1, opacity: 1, rotate: 0 }
            }
            exit={{ scale: 0.4, opacity: 0, rotate: -90 }}
            transition={
              active
                ? { duration: 0.6, ease: "easeOut" }
                : { type: "spring", stiffness: 400, damping: 18 }
            }
          >
            <defs>
              <linearGradient id="lupa-map-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle cx="11" cy="11" r="7" stroke="url(#lupa-map-grad)" strokeWidth="3" />
            <path d="m19.5 19.5-3.5-3.5" stroke="url(#lupa-map-grad)" strokeWidth="3.2" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════
   Typewriter placeholder
   ═══════════════════════════════════ */
const PLACE_HINTS = [
  "¿Dónde hay música en vivo en Barrio Yungay esta noche?",
  "Busca un Tesoro de Barrio en Valparaíso…",
  "Taproom con identidad propia en Providencia…",
  "Joya Oculta con buena coctelería en Barrio Italia…",
  "¿Cuál es el Patrimonio Vivo más cercano a mí?",
];

function useTypewriter(phrases: string[], speed = 45, pause = 2200, deleteSpeed = 25) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];
    const tick = () => {
      if (!isDeleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pause);
          return;
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          return;
        }
      }
      timeoutRef.current = setTimeout(tick, isDeleting ? deleteSpeed : speed);
    };
    timeoutRef.current = setTimeout(tick, isDeleting ? deleteSpeed : speed);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, isDeleting, phraseIndex, phrases, speed, pause, deleteSpeed]);

  return text;
}

/* ─── Quick city filter chips ─── */
const CITY_CHIPS = [
  { label: "🏠 Todos", shortLabel: "Todo Chile", value: "" },
  { label: "🌃 Santiago", shortLabel: "Santiago", value: "santiago" },
  { label: "🌊 Valparaíso", shortLabel: "Valparaíso", value: "valparaiso" },
  { label: "🌫️ Valdivia", shortLabel: "Valdivia", value: "valdivia" },
  { label: "🏄 Pichilemu", shortLabel: "Pichilemu", value: "pichilemu" },
] as const;

type DiscoveryMode =
  | "all"
  | "top-rated"
  | "tesoros"
  | "patrimonio"
  | "vanguardia"
  | "joya"
  | "with-photo"
  | "mapped"
  | "saved";
type OccasionMode = "after-work" | "date-night" | "friends" | "explorer" | "tasting";
type PlanStopKind = "lead" | "backup" | "wildcard";

interface PlannedStop {
  kind: PlanStopKind;
  eyebrow: string;
  title: string;
  reason: string;
  place: Place;
}

const DISCOVERY_MODES: Array<{
  value: DiscoveryMode;
  label: string;
  helper: string;
  icon: string;
}> = [
  {
    value: "all",
    label: "Todo lo bueno",
    helper: "Una mezcla rica de bares, taprooms y cervecerías",
    icon: "✨",
  },
  {
    value: "top-rated",
    label: "Top comunidad",
    helper: "Los spots con mejores reseñas",
    icon: "🏆",
  },
  {
    value: "tesoros",
    label: "Tesoros de Barrio",
    helper: "Locales con historia y alma propia",
    icon: "🗝️",
  },
  {
    value: "patrimonio",
    label: "Patrimonio Vivo",
    helper: "Locales arraigados con historia comunitaria",
    icon: "🏛️",
  },
  {
    value: "vanguardia",
    label: "Vanguardia Urbana",
    helper: "Artesanal moderno con identidad visual fuerte",
    icon: "🌆",
  },
  {
    value: "joya",
    label: "Joyas Ocultas",
    helper: "Pequeños spots que sorprenden antes de ser famosos",
    icon: "💎",
  },
  {
    value: "with-photo",
    label: "Con foto",
    helper: "Lugares que seducen a primera vista",
    icon: "📸",
  },
  {
    value: "mapped",
    label: "Listos para ir",
    helper: "Ubicables al tiro en el mapa",
    icon: "🗺️",
  },
  {
    value: "saved",
    label: "Mis guardados",
    helper: "Tu colección personal para volver",
    icon: "💛",
  },
];

function getAverageRating(place: Place) {
  if (!place.reviews?.length) return 0;
  return place.reviews.reduce((sum, review) => sum + review.rating, 0) / place.reviews.length;
}

function getReviewCount(place: Place) {
  return place.reviews?.length ?? 0;
}

function hasCoordinates(place: Place) {
  return Boolean(place.coordinates?.lat && place.coordinates?.lng);
}

function getPlaceSnippet(place: Place) {
  const description = place.description?.trim();
  if (!description) return "Un lugar cervecero listo para sumarse a tu próxima salida.";
  if (description.length <= 120) return description;
  return `${description.slice(0, 117).trimEnd()}…`;
}

function getPlaceStats(places: Place[]) {
  const cities = new Set(
    places.map((place) => place.address?.city?.trim().toLowerCase()).filter(Boolean),
  );
  const allRatings = places.flatMap((place) => place.reviews?.map((review) => review.rating) || []);
  const avgRating = allRatings.length
    ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
    : "0.0";
  const withCoords = places.filter(hasCoordinates).length;
  const withPhotos = places.filter((place) => Boolean(place.coverImage)).length;

  return {
    total: places.length,
    cities: cities.size,
    avgRating,
    withCoords,
    withPhotos,
  };
}

function getPlaceEmotionalLine(place: Place, averageRating: number) {
  const reviews = getReviewCount(place);

  if (averageRating >= 4.8 && reviews >= 3) {
    return "Una apuesta segura cuando quieres salirte bien a la primera.";
  }

  if (Boolean(place.coverImage) && hasCoordinates(place)) {
    return "Tiene buena pinta y además está listo para ubicar en tu ruta.";
  }

  if (reviews >= 4) {
    return "La comunidad ya lo viene validando con ganas.";
  }

  if (hasCoordinates(place)) {
    return "Perfecto para una escapada improvisada con mapa en mano.";
  }

  return "Un hallazgo con vibra propia para descubrir sin apuro.";
}

const OCCASION_MODES: Array<{
  value: OccasionMode;
  label: string;
  helper: string;
  icon: string;
}> = [
  {
    value: "after-work",
    label: "After office",
    helper: "Para decidir rápido y salir bien sin tanto análisis",
    icon: "🍺",
  },
  {
    value: "date-night",
    label: "Cita",
    helper: "Más foco en presencia, rating y plan redondo",
    icon: "✨",
  },
  {
    value: "friends",
    label: "Con amigos",
    helper: "Prioriza lugares validados por la comunidad",
    icon: "👥",
  },
  {
    value: "explorer",
    label: "Explorador",
    helper: "Equilibrio entre hallazgo, mapa y sorpresa",
    icon: "🧭",
  },
  {
    value: "tasting",
    label: "Modo catador",
    helper: "Busca calidad percibida y mejores reseñas",
    icon: "🍻",
  },
];
function getPlanTitle(mode: DiscoveryMode, cityLabel: string) {
  if (mode === "top-rated") return `Plan ganador en ${cityLabel}`;
  if (mode === "tesoros") return `Tesoros de ${cityLabel}`;
  if (mode === "patrimonio") return `Patrimonio de ${cityLabel}`;
  if (mode === "vanguardia") return `Vanguardia de ${cityLabel}`;
  if (mode === "joya") return `Joyas de ${cityLabel}`;
  if (mode === "with-photo") return `Ruta visual en ${cityLabel}`;
  if (mode === "mapped") return `Escapada lista en ${cityLabel}`;
  if (mode === "saved") return "Tu ruta guardada";
  return `Plan cervecero en ${cityLabel}`;
}

function getOccasionLabel(mode: OccasionMode) {
  return OCCASION_MODES.find((preset) => preset.value === mode)?.label ?? "Panorama";
}

function getOccasionHelper(mode: OccasionMode) {
  return (
    OCCASION_MODES.find((preset) => preset.value === mode)?.helper ??
    "Una lente extra para tomar una mejor decisión."
  );
}

function getOccasionTitle(mode: OccasionMode, cityLabel: string) {
  if (mode === "after-work") return `Salida sin fricción en ${cityLabel}`;
  if (mode === "date-night") return `Plan que se siente redondo en ${cityLabel}`;
  if (mode === "friends") return `Ruta para ir con la crew en ${cityLabel}`;
  if (mode === "explorer") return `Radar de hallazgos en ${cityLabel}`;
  return `Selección de catador en ${cityLabel}`;
}

function getOccasionScore(place: Place, mode: OccasionMode, favoritos: string[]) {
  const averageRating = getAverageRating(place);
  const reviewCount = getReviewCount(place);
  const photoBonus = place.coverImage ? 1.4 : 0;
  const mapBonus = hasCoordinates(place) ? 1.6 : 0;
  const favoriteBonus = favoritos.includes(place._id) ? 0.9 : 0;

  if (mode === "after-work") {
    return (
      averageRating * 2.2 +
      Math.min(reviewCount, 5) * 0.45 +
      mapBonus * 1.5 +
      photoBonus +
      favoriteBonus
    );
  }

  if (mode === "date-night") {
    return averageRating * 2.8 + photoBonus * 2 + mapBonus + Math.min(reviewCount, 4) * 0.35;
  }

  if (mode === "friends") {
    return (
      averageRating * 1.8 +
      Math.min(reviewCount, 8) * 0.95 +
      mapBonus +
      photoBonus * 0.5 +
      favoriteBonus
    );
  }

  if (mode === "explorer") {
    return (
      averageRating * 1.6 +
      photoBonus * 1.4 +
      mapBonus * 1.4 +
      Math.max(0, 4 - Math.min(reviewCount, 4)) * 1.1
    );
  }

  return averageRating * 3.1 + Math.min(reviewCount, 8) * 0.65 + photoBonus + favoriteBonus * 0.4;
}

function getWildcardScore(place: Place, mode: OccasionMode, favoritos: string[]) {
  const reviewCount = getReviewCount(place);
  const noveltyBonus = Math.max(0, 5 - Math.min(reviewCount, 5)) * 1.2;
  const visualBonus = place.coverImage ? 1.7 : 0;
  const mapBonus = hasCoordinates(place) ? 1.4 : 0;

  return getOccasionScore(place, mode, favoritos) * 0.55 + noveltyBonus + visualBonus + mapBonus;
}

function getPlanStopReason(place: Place, mode: OccasionMode, kind: PlanStopKind) {
  const averageRating = getAverageRating(place);
  const reviewCount = getReviewCount(place);
  const facts: string[] = [];

  if (averageRating >= 4.7) facts.push(`rating ${averageRating.toFixed(1)}`);
  if (reviewCount >= 3) facts.push(`${reviewCount} reseñas`);
  if (place.coverImage) facts.push("buena pinta visual");
  if (hasCoordinates(place)) facts.push("listo para ubicar");

  let base = "";

  if (kind === "lead") {
    if (mode === "after-work") base = "Es la salida más simple para caer parado rápido.";
    else if (mode === "date-night")
      base = "Se siente como una elección segura para impresionar sin exagerar.";
    else if (mode === "friends")
      base = "Tiene madera para convertirse en el punto de encuentro del grupo.";
    else if (mode === "explorer")
      base = "Abre la noche con una mezcla rica entre descubrimiento y seguridad.";
    else base = "Es la parada más coherente si quieres probar algo con estándar alto.";
  } else if (kind === "backup") {
    base = "Te cubre si quieres comparar opciones sin bajar la expectativa.";
  } else {
    base = "Guárdalo como wildcard para estirar la ruta o probar algo distinto.";
  }

  if (facts.length === 0) return base;
  return `${base} ${facts.slice(0, 2).join(" · ")}.`;
}

function buildPlannedStops({
  places,
  favoritos,
  occasionMode,
  pinnedPlace,
}: {
  places: Place[];
  favoritos: string[];
  occasionMode: OccasionMode;
  pinnedPlace: Place | null;
}) {
  if (places.length === 0) return [] as PlannedStop[];

  const ranked = [...places].sort(
    (a, b) =>
      getOccasionScore(b, occasionMode, favoritos) - getOccasionScore(a, occasionMode, favoritos),
  );

  const lead = pinnedPlace ?? ranked[0];
  const remaining = ranked.filter((place) => place._id !== lead._id);
  const backup = remaining[0] ?? null;
  const wildcard =
    [...remaining]
      .filter((place) => place._id !== backup?._id)
      .sort(
        (a, b) =>
          getWildcardScore(b, occasionMode, favoritos) -
          getWildcardScore(a, occasionMode, favoritos),
      )[0] ??
    remaining[1] ??
    null;

  return [
    {
      kind: "lead" as const,
      eyebrow: "Parada principal",
      title: lead.name,
      reason: getPlanStopReason(lead, occasionMode, "lead"),
      place: lead,
    },
    ...(backup
      ? [
          {
            kind: "backup" as const,
            eyebrow: "Plan B ganador",
            title: backup.name,
            reason: getPlanStopReason(backup, occasionMode, "backup"),
            place: backup,
          },
        ]
      : []),
    ...(wildcard
      ? [
          {
            kind: "wildcard" as const,
            eyebrow: "Wildcard de la noche",
            title: wildcard.name,
            reason: getPlanStopReason(wildcard, occasionMode, "wildcard"),
            place: wildcard,
          },
        ]
      : []),
  ];
}

function getPlanCopyText({
  cityLabel,
  occasionMode,
  plannedStops,
}: {
  cityLabel: string;
  occasionMode: OccasionMode;
  plannedStops: PlannedStop[];
}) {
  const lines = [
    `Lúpulos · Ruta beta en ${cityLabel}`,
    `Modo: ${getOccasionLabel(occasionMode)}`,
    "",
    ...plannedStops.map(
      (stop, index) =>
        `${index + 1}. ${stop.place.name} (${stop.place.address.city}) — ${stop.reason.replace(/\s+/g, " ").trim()}`,
    ),
  ];

  return lines.join("\n");
}

function InsightPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border p-3 backdrop-blur-sm"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.16em] uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {icon} {label}
      </p>
      <p
        className="mt-2 text-sm leading-snug font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

const NETWORK_FOMO = (total: number, cities: number): string[] => [
  `La red ya conecta ${cities} ciudad${cities === 1 ? "" : "es"} y ${total} locales curados en Chile.`,
  "3 nuevos locales en Valparaíso se unieron esta semana.",
  "Barrio Italia está al 90% de cobertura en la ruta nacional.",
  "La ruta de experiencias curadas crece ciudad a ciudad.",
  "Providencia, Yungay, Biobío — la red llega a cada barrio con carácter.",
];

function LiveNetworkSignal({ total, cities }: { total: number; cities: number }) {
  const [idx, setIdx] = useState(0);
  const signals = useMemo(() => NETWORK_FOMO(total, cities), [total, cities]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % signals.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [signals.length]);

  return (
    <div
      className="mt-4 rounded-2xl border p-3"
      style={{
        borderColor: "rgba(251,191,36,0.20)",
        background: "rgba(251,191,36,0.04)",
      }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ background: "var(--color-amber-primary)" }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <p
          className="text-[10px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--color-amber-primary)" }}
        >
          Red activa
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          className="mt-1.5 text-[12px] leading-relaxed font-medium"
          style={{ color: "var(--color-text-secondary)" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.32 }}
        >
          {signals[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function OwnerLeadCard({
  onOpen,
  totalPlaces,
  cityCount,
  avgRating,
  liveSignal,
}: {
  onOpen: () => void;
  totalPlaces: number;
  cityCount: number;
  avgRating: string;
  liveSignal: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-[28px] border p-4 backdrop-blur-sm"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{
            borderColor: "var(--color-border-light)",
            background: "rgba(251,191,36,0.08)",
            color: "var(--color-amber-primary)",
          }}
        >
          Para dueños de locales · Chile
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold"
          style={{
            borderColor: "rgba(251,191,36,0.35)",
            background: "rgba(251,191,36,0.10)",
            color: "var(--color-amber-primary)",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ background: "var(--color-amber-primary)" }}
              animate={{ scale: [1, 2.6, 1], opacity: [0.9, 0, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-amber-primary)" }}
            />
          </span>
          Tesoro de Barrio
        </span>
      </div>
      <h3
        className="mt-3 text-xl leading-tight font-extrabold"
        style={{ color: "var(--color-text-primary)" }}
      >
        ¿Es tu local el próximo referente de tu comuna?
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        Únete a la red que conecta a los dueños de bares con alma con el público que busca lo
        excepcional. Ya estamos en Yungay, Providencia y los barrios con más carácter de Chile. No
        dejes que tu comuna se quede atrás.
      </p>
      <LiveNetworkSignal total={totalPlaces} cities={cityCount} />
      {/* Result-oriented copy */}
      <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <p>
          <span style={{ color: "var(--color-amber-primary)", fontWeight: 700 }}>
            🗺️ En la ruta que importa
          </span>{" "}
          — apareces en búsquedas locales, rutas cerveceras y en el concierge nacional.
        </p>
        <p>
          <span style={{ color: "var(--color-amber-primary)", fontWeight: 700 }}>
            🏅 Tu categoría de identidad
          </span>{" "}
          — Patrimonio Vivo, Vanguardia Urbana o Joya Oculta. Elige la que te define.
        </p>
        <p>
          <span style={{ color: "var(--color-amber-primary)", fontWeight: 700 }}>
            🌐 Red nacional, impacto local
          </span>{" "}
          — una sola ficha, visibilidad en toda la red: ciudad, barrio y ruta nacional.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div
          className="rounded-2xl border px-3 py-2 text-[11px] font-semibold"
          style={{
            borderColor: "var(--color-border-light)",
            background: "rgba(251,191,36,0.04)",
            color: "var(--color-text-primary)",
          }}
        >
          🔎 {totalPlaces} locales curados
        </div>
        <div
          className="rounded-2xl border px-3 py-2 text-[11px] font-semibold"
          style={{
            borderColor: "var(--color-border-light)",
            background: "rgba(251,191,36,0.04)",
            color: "var(--color-text-primary)",
          }}
        >
          🌆 {cityCount} ciudades activas
        </div>
        <div
          className="rounded-2xl border px-3 py-2 text-[11px] font-semibold"
          style={{
            borderColor: "var(--color-border-light)",
            background: "rgba(251,191,36,0.04)",
            color: "var(--color-text-primary)",
          }}
        >
          ⭐ {avgRating}★ promedio
        </div>
      </div>
      <button
        onClick={onOpen}
        className="mt-4 w-full rounded-full px-4 py-3 text-sm font-bold transition-all"
        style={{
          background: "var(--gradient-button-primary)",
          color: "var(--color-text-dark)",
          boxShadow: "var(--shadow-amber-glow)",
        }}
      >
        Reclamar mi lugar en la ruta nacional
      </button>
      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        La red crece semana a semana. Entra ahora y posiciona tu local antes de que tu competencia
        lo haga primero.
      </p>
    </div>
  );
}

export default function LugaresPage() {
  const [lugares, setLugares] = useState<Place[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("all");
  const [occasionMode, setOccasionMode] = useState<OccasionMode>("after-work");
  const [searchFocused, setSearchFocused] = useState(false);
  const typedPlaceholder = useTypewriter(PLACE_HINTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [usuario, setUsuario] = useState<{ _id: string; username: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritos(favs);
    const user = localStorage.getItem("user");
    if (user) setUsuario(JSON.parse(user));
    fetchLugares();
  }, []);

  const fetchLugares = async () => {
    try {
      const res = await api.get(`/location`);
      const lugaresData = Array.isArray(res.data.data) ? res.data.data : [];
      setLugares(lugaresData.reverse());
    } catch (error) {
      console.error("❌ Error al obtener lugares:", error);
      setLugares([]);
    }
  };

  const toggleFavorito = useCallback((id: string) => {
    setFavoritos((prevFavoritos) => {
      const nuevosFavoritos = prevFavoritos.includes(id)
        ? prevFavoritos.filter((fid) => fid !== id)
        : [...prevFavoritos, id];
      localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
      return nuevosFavoritos;
    });
  }, []);

  const handleSelectPlace = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleNavigateToPlace = useCallback((id: string) => {
    window.location.href = `/lugares/${id}`;
  }, []);

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;

  const lugaresFiltrados = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = lugares.filter((lugar) => {
      const haystack = [
        lugar.name,
        lugar.description,
        lugar.address?.street,
        lugar.address?.city,
        lugar.address?.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      const matchCity = cityFilter
        ? (lugar.address?.city ?? "").toLowerCase().includes(cityFilter)
        : true;
      const matchMode =
        discoveryMode === "all"
          ? true
          : discoveryMode === "top-rated"
            ? getReviewCount(lugar) > 0
            : discoveryMode === "tesoros"
              ? getReviewCount(lugar) > 0 && getAverageRating(lugar) >= 4.0
              : discoveryMode === "patrimonio"
                ? getReviewCount(lugar) >= 3 && getAverageRating(lugar) >= 4.5
                : discoveryMode === "vanguardia"
                  ? Boolean(lugar.coverImage) && hasCoordinates(lugar)
                  : discoveryMode === "joya"
                    ? getReviewCount(lugar) <= 3 && Boolean(lugar.coverImage)
                    : discoveryMode === "with-photo"
                      ? Boolean(lugar.coverImage)
                      : discoveryMode === "mapped"
                        ? hasCoordinates(lugar)
                        : favoritos.includes(lugar._id);

      return matchSearch && matchCity && matchMode;
    });

    return [...filtered].sort((a, b) => {
      if (discoveryMode === "with-photo") {
        const photoDiff = Number(Boolean(b.coverImage)) - Number(Boolean(a.coverImage));
        if (photoDiff !== 0) return photoDiff;
      }

      if (discoveryMode === "mapped") {
        const mapDiff = Number(hasCoordinates(b)) - Number(hasCoordinates(a));
        if (mapDiff !== 0) return mapDiff;
      }

      const ratingDiff = getAverageRating(b) - getAverageRating(a);
      if (ratingDiff !== 0) return ratingDiff;

      return getReviewCount(b) - getReviewCount(a);
    });
  }, [lugares, searchQuery, cityFilter, discoveryMode, favoritos]);

  const globalStats = useMemo(() => getPlaceStats(lugares), [lugares]);
  const filteredStats = useMemo(
    () => getPlaceStats(lugaresFiltrados.length ? lugaresFiltrados : lugares),
    [lugaresFiltrados, lugares],
  );

  const selectedPlace = useMemo(
    () => lugaresFiltrados.find((lugar) => lugar._id === selectedId) ?? null,
    [lugaresFiltrados, selectedId],
  );

  const topPlace = useMemo(() => {
    const source = lugaresFiltrados.length ? lugaresFiltrados : lugares;
    if (source.length === 0) return null;

    return [...source].sort((a, b) => {
      const ratingDiff = getAverageRating(b) - getAverageRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      return getReviewCount(b) - getReviewCount(a);
    })[0];
  }, [lugaresFiltrados, lugares]);

  const spotlightPlace = selectedPlace ?? topPlace;

  const activeCity = useMemo(
    () => CITY_CHIPS.find((chip) => chip.value === cityFilter) ?? CITY_CHIPS[0],
    [cityFilter],
  );

  const activeMode = useMemo(
    () => DISCOVERY_MODES.find((mode) => mode.value === discoveryMode) ?? DISCOVERY_MODES[0],
    [discoveryMode],
  );

  const cityPulse = useMemo(() => {
    const counts = new Map<string, number>();

    lugaresFiltrados.forEach((lugar) => {
      const city = lugar.address?.city?.trim();
      if (!city) return;
      counts.set(city, (counts.get(city) ?? 0) + 1);
    });

    const hottestCity = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return hottestCity ? { city: hottestCity[0], count: hottestCity[1] } : null;
  }, [lugaresFiltrados]);

  const ownerLiveSignal = useMemo(() => {
    if (cityPulse) {
      return `${cityPulse.city} está especialmente activa ahora mismo con ${cityPulse.count} hallazgo${cityPulse.count === 1 ? "" : "s"} en el radar cervecero.`;
    }

    if (globalStats.total > 0) {
      return `La comunidad ya explora ${globalStats.total} lugares con historia, foto y mapa para decidir su próxima salida.`;
    }

    return "Sé de los primeros locales con historia en el mapa que trae gente a tu puerta.";
  }, [cityPulse, globalStats.total]);

  const handleSurpriseMe = useCallback(() => {
    if (lugaresFiltrados.length === 0) return;
    const randomPlace = lugaresFiltrados[Math.floor(Math.random() * lugaresFiltrados.length)];
    setSelectedId(randomPlace._id);
  }, [lugaresFiltrados]);

  const resetDiscovery = useCallback(() => {
    setSearchQuery("");
    setCityFilter("");
    setDiscoveryMode("all");
  }, []);

  const hasActiveFilters = Boolean(searchQuery || cityFilter || discoveryMode !== "all");
  const savedInView = useMemo(
    () => lugaresFiltrados.filter((lugar) => favoritos.includes(lugar._id)).length,
    [lugaresFiltrados, favoritos],
  );
  const spotlightAverageRating = spotlightPlace ? getAverageRating(spotlightPlace) : 0;
  const spotlightReviewCount = spotlightPlace ? getReviewCount(spotlightPlace) : 0;
  const spotlightSaved = spotlightPlace ? favoritos.includes(spotlightPlace._id) : false;
  const spotlightEmotionalLine = spotlightPlace
    ? getPlaceEmotionalLine(spotlightPlace, spotlightAverageRating)
    : "";
  const plannedStops = useMemo(
    () =>
      buildPlannedStops({
        places: lugaresFiltrados.length ? lugaresFiltrados : lugares,
        favoritos,
        occasionMode,
        pinnedPlace: spotlightPlace,
      }),
    [lugaresFiltrados, lugares, favoritos, occasionMode, spotlightPlace],
  );
  const occasionPreset = useMemo(
    () => OCCASION_MODES.find((preset) => preset.value === occasionMode) ?? OCCASION_MODES[0],
    [occasionMode],
  );

  const handleCopyPlan = useCallback(async () => {
    if (plannedStops.length === 0) return;

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }

      await navigator.clipboard.writeText(
        getPlanCopyText({
          cityLabel: activeCity.shortLabel,
          occasionMode,
          plannedStops,
        }),
      );
      setSnackbarMessage("Plan cervecero copiado 🍻");
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage("No pudimos copiar el plan, pero ya quedó armado en pantalla ✨");
      setSnackbarOpen(true);
    }
  }, [activeCity.shortLabel, occasionMode, plannedStops]);

  useEffect(() => {
    if (lugaresFiltrados.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }

    if (!selectedId || !lugaresFiltrados.some((lugar) => lugar._id === selectedId)) {
      setSelectedId(lugaresFiltrados[0]._id);
    }
  }, [lugaresFiltrados, selectedId]);

  if (!mounted) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ color: "var(--color-text-primary)" }}
    >
      <GoldenBackground />
      <Navbar />

      <main className="relative z-[2] mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-12 sm:px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col items-center text-center"
        >
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
            La ruta nacional · Chile
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--color-text-primary)" }}
          >
            La nueva cartografía{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 20%, var(--color-amber-hover) 40%, var(--color-amber-primary) 60%, var(--color-amber-light) 80%, var(--color-amber-primary) 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "magic-gradient-shift 4s ease-in-out infinite",
              }}
            >
              de la cultura en Chile.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Desde los Tesoros de Barrio hasta los íconos de cada ciudad. La ruta que conecta a
            quienes buscan lo excepcional con los locales que lo son.
          </motion.p>

          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-4 text-sm font-semibold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {globalStats.total} lugares recomendados · {globalStats.cities} ciudades ·{" "}
            {globalStats.avgRating}★ por la comunidad
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_380px] xl:grid-cols-[minmax(0,1.35fr)_400px]">
          <section className="order-2 min-w-0 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p
                  className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--color-amber-primary)" }}
                >
                  Locales con identidad
                </p>
                <h2
                  className="mt-1 text-2xl font-extrabold tracking-tight"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Lugares que definen su barrio
                </h2>
                <p
                  className="mt-2 max-w-2xl text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {searchQuery
                    ? `Resultados para “${searchQuery}” en ${activeCity.shortLabel}.`
                    : cityFilter
                      ? `Descubre spots en ${activeCity.shortLabel} con mejor foto, rating y acceso rápido al mapa.`
                      : "Casonas, terrazas y taprooms con historia, curados por la comunidad que los conoce."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
                    borderColor: "var(--color-border-light)",
                    background: "rgba(251,191,36,0.05)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {lugaresFiltrados.length} hallazgo{lugaresFiltrados.length === 1 ? "" : "s"}
                </div>
                <div
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
                    borderColor: "var(--color-border-light)",
                    background: "rgba(251,191,36,0.05)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {activeMode.label}
                </div>
                <div
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
                    borderColor: "var(--color-border-light)",
                    background: "rgba(251,191,36,0.05)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {occasionPreset.icon} {occasionPreset.label}
                </div>
              </div>
            </motion.div>

            <PlaceDiscoveryGrid
              places={lugaresFiltrados}
              selectedId={selectedId}
              favoritos={favoritos}
              onSelect={handleSelectPlace}
              onToggleFavorito={toggleFavorito}
              onNavigate={handleNavigateToPlace}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="mt-5 rounded-2xl border p-4 backdrop-blur-sm"
              style={{
                background: "var(--color-surface-card)",
                borderColor: "var(--color-border-subtle)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Mostrando{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  {lugaresFiltrados.length}
                </strong>{" "}
                de <strong style={{ color: "var(--color-text-primary)" }}>{lugares.length}</strong>{" "}
                lugares.
                {searchQuery && (
                  <>
                    {" "}
                    Búsqueda activa para{" "}
                    <strong style={{ color: "var(--color-text-primary)" }}>{searchQuery}</strong>.
                  </>
                )}
                {discoveryMode !== "all" && (
                  <>
                    {" "}
                    Modo actual:{" "}
                    <strong style={{ color: "var(--color-text-primary)" }}>
                      {activeMode.label}
                    </strong>
                    .
                  </>
                )}
              </p>
            </motion.div>
          </section>

          <aside className="order-1 min-w-0 lg:order-2">
            <div className="flex flex-col gap-4 lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.04 }}
              >
                <OwnerLeadCard
                  onOpen={() => setModalOpen(true)}
                  totalPlaces={globalStats.total}
                  cityCount={globalStats.cities}
                  avgRating={globalStats.avgRating}
                  liveSignal={ownerLiveSignal}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-[28px] border p-4 backdrop-blur-md"
                style={{
                  background: "rgba(26, 14, 8, 0.75)",
                  borderColor: "var(--color-border-subtle)",
                }}
              >
                <p
                  className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--color-amber-primary)" }}
                >
                  Tu próxima salida
                </p>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Busca por barrio, ambiente o tipo de lugar. El mapa te lleva directo a los
                  rincones que valen la pena.
                </p>

                <div className="mt-3">
                  <GradientBorder active={searchFocused} radius={24} borderWidth={1.5}>
                    <div
                      className="flex items-center gap-3 rounded-[22.5px] px-4 py-3"
                      style={{ background: "var(--color-surface-card)" }}
                    >
                      <MagicMapIcon active={searchFocused} />
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
                        {!searchQuery && (
                          <div
                            className="pointer-events-none absolute inset-0 flex items-center text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <span>{typedPlaceholder}</span>
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                              className="ml-px inline-block h-4 w-[2px] rounded-full"
                              style={{ background: "var(--color-amber-primary)" }}
                            />
                          </div>
                        )}
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs transition-colors"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </GradientBorder>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {DISCOVERY_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setDiscoveryMode(mode.value)}
                      className="rounded-2xl border p-3 text-left transition-all"
                      style={{
                        borderColor:
                          discoveryMode === mode.value
                            ? "var(--color-amber-primary)"
                            : "var(--color-border-light)",
                        background:
                          discoveryMode === mode.value
                            ? "rgba(251,191,36,0.12)"
                            : "rgba(251,191,36,0.04)",
                        boxShadow:
                          discoveryMode === mode.value ? "var(--shadow-amber-glow)" : "none",
                      }}
                    >
                      <p
                        className="text-xs font-bold"
                        style={{
                          color:
                            discoveryMode === mode.value
                              ? "var(--color-amber-primary)"
                              : "var(--color-text-primary)",
                        }}
                      >
                        {mode.icon} {mode.label}
                      </p>
                      <p
                        className="mt-1 text-[11px] leading-relaxed"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {mode.helper}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {CITY_CHIPS.map((chip) => (
                    <button
                      key={chip.value}
                      onClick={() => setCityFilter(chip.value)}
                      className="rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all"
                      style={{
                        borderColor:
                          cityFilter === chip.value
                            ? "var(--color-amber-primary)"
                            : "var(--color-border-light)",
                        color:
                          cityFilter === chip.value
                            ? "var(--color-amber-primary)"
                            : "var(--color-text-secondary)",
                        background:
                          cityFilter === chip.value
                            ? "rgba(251,191,36,0.12)"
                            : "rgba(251,191,36,0.04)",
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSurpriseMe}
                    className="flex-1 rounded-full px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                      boxShadow: "var(--shadow-amber-glow)",
                    }}
                  >
                    🎲 Sorpréndeme
                  </button>
                  <button
                    onClick={resetDiscovery}
                    disabled={!hasActiveFilters}
                    className="rounded-full border px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-45"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="rounded-[28px] border p-3 backdrop-blur-sm"
                style={{
                  background: "var(--color-surface-card)",
                  borderColor: "var(--color-border-subtle)",
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3 px-1">
                  <div>
                    <p
                      className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Mapa vivo
                    </p>
                    <p
                      className="mt-1 text-sm font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {filteredStats.withCoords} lugares listos para ubicarse
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p
                      className="text-right text-[11px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {activeCity.shortLabel}
                    </p>
                    <div
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                      style={{
                        borderColor: "var(--color-border-light)",
                        background: "rgba(251,191,36,0.08)",
                        color: "var(--color-amber-primary)",
                      }}
                    >
                      {activeMode.label}
                    </div>
                  </div>
                </div>

                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{ height: 300, borderColor: "var(--color-border-subtle)" }}
                >
                  <MapView
                    places={lugaresFiltrados}
                    selectedId={selectedId}
                    onSelectPlace={handleSelectPlace}
                  />
                </div>
                <p
                  className="mt-3 px-1 text-[12px] leading-relaxed"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {cityPulse
                    ? `${cityPulse.city} está especialmente activa ahora mismo con ${cityPulse.count} hallazgo${cityPulse.count === 1 ? "" : "s"} en tu radar.`
                    : `Explora ${filteredStats.total} lugares y usa el mapa como copiloto para decidir más rápido.`}
                </p>
              </motion.div>

              {spotlightPlace && (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                  className="overflow-hidden rounded-[28px] border"
                  style={{
                    background: "var(--color-surface-card)",
                    borderColor: "var(--color-border-subtle)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {spotlightPlace.coverImage ? (
                      <Image
                        src={getImageUrl(spotlightPlace.coverImage)}
                        alt={spotlightPlace.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 400px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-5xl"
                        style={{
                          background:
                            "radial-gradient(circle at top, rgba(251,191,36,0.28), rgba(14,14,14,0.08) 42%), linear-gradient(135deg, rgba(120,53,15,0.85), rgba(41,24,16,0.96))",
                        }}
                      >
                        🍻
                      </div>
                    )}

                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(12,10,9,0.10) 0%, rgba(12,10,9,0.18) 35%, rgba(12,10,9,0.88) 100%)",
                      }}
                    />

                    <div className="absolute top-4 left-4">
                      <div
                        className="rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase"
                        style={{
                          borderColor: "rgba(255,255,255,0.16)",
                          background: "rgba(17,24,39,0.34)",
                          color: "white",
                        }}
                      >
                        {selectedPlace ? "Selección activa" : "Favorito de la comunidad"}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div
                        className="rounded-full border px-3 py-1 text-[10px] font-semibold"
                        style={{
                          borderColor: "rgba(255,255,255,0.16)",
                          background: "rgba(17,24,39,0.34)",
                          color: "white",
                        }}
                      >
                        {spotlightSaved ? "💛 Guardado" : "✨ Recomendado"}
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                        {spotlightPlace.address.city}, {spotlightPlace.address.country}
                      </p>
                      <h3 className="mt-1 text-2xl font-extrabold text-white">
                        {spotlightPlace.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {getPlaceSnippet(spotlightPlace)}
                    </p>
                    <p
                      className="mt-3 text-[13px] leading-relaxed"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {spotlightEmotionalLine}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <div
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        style={{
                          borderColor: "var(--color-border-light)",
                          background: "rgba(251,191,36,0.08)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ⭐ {spotlightAverageRating.toFixed(1)} de rating
                      </div>
                      <div
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        style={{
                          borderColor: "var(--color-border-light)",
                          background: "rgba(251,191,36,0.08)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        💬 {spotlightReviewCount} reseña{spotlightReviewCount === 1 ? "" : "s"}
                      </div>
                      <div
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        style={{
                          borderColor: "var(--color-border-light)",
                          background: "rgba(251,191,36,0.08)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {hasCoordinates(spotlightPlace) ? "📍 Listo para ir" : "📝 Falta ubicar"}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Rating
                        value={spotlightAverageRating}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{
                          "& .MuiRating-iconFilled": { color: "var(--color-amber-primary)" },
                          "& .MuiRating-iconEmpty": { color: "var(--color-border-medium)" },
                        }}
                      />
                      <p
                        className="text-[11px] font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {spotlightAverageRating.toFixed(1)} · {spotlightReviewCount} reseña
                        {spotlightReviewCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleNavigateToPlace(spotlightPlace._id)}
                        className="flex-1 rounded-full px-4 py-2 text-sm font-bold transition-all"
                        style={{
                          background: "var(--gradient-button-primary)",
                          color: "var(--color-text-dark)",
                          boxShadow: "var(--shadow-amber-glow)",
                        }}
                      >
                        Abrir lugar
                      </button>
                      <button
                        onClick={() => handleSelectPlace(spotlightPlace._id)}
                        className="rounded-full border px-4 py-2 text-sm font-semibold transition-all"
                        style={{
                          borderColor: "var(--color-border-light)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        Centrar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {plannedStops.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="rounded-[28px] border p-4 backdrop-blur-sm"
                  style={{
                    background: "var(--color-surface-card)",
                    borderColor: "var(--color-border-subtle)",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: "var(--color-amber-primary)" }}
                  >
                    Concierge beta
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {OCCASION_MODES.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setOccasionMode(preset.value)}
                        className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all"
                        style={{
                          borderColor:
                            occasionMode === preset.value
                              ? "var(--color-amber-primary)"
                              : "var(--color-border-light)",
                          background:
                            occasionMode === preset.value
                              ? "rgba(251,191,36,0.14)"
                              : "rgba(251,191,36,0.04)",
                          color:
                            occasionMode === preset.value
                              ? "var(--color-amber-primary)"
                              : "var(--color-text-primary)",
                          boxShadow:
                            occasionMode === preset.value ? "var(--shadow-amber-glow)" : "none",
                        }}
                      >
                        {preset.icon} {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    {plannedStops.map((stop) => {
                      const averageRating = getAverageRating(stop.place);
                      const reviewCount = getReviewCount(stop.place);

                      return (
                        <button
                          key={`${stop.kind}-${stop.place._id}`}
                          onClick={() => handleSelectPlace(stop.place._id)}
                          className="w-full rounded-2xl border p-3 text-left transition-all"
                          style={{
                            borderColor:
                              selectedId === stop.place._id
                                ? "var(--color-amber-primary)"
                                : "var(--color-border-light)",
                            background:
                              selectedId === stop.place._id
                                ? "rgba(251,191,36,0.10)"
                                : "rgba(251,191,36,0.04)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                                style={{ color: "var(--color-amber-primary)" }}
                              >
                                {stop.eyebrow}
                              </p>
                              <p
                                className="mt-1 truncate text-sm font-extrabold"
                                style={{ color: "var(--color-text-primary)" }}
                              >
                                {stop.title}
                              </p>
                              <p
                                className="mt-1 text-[12px] leading-relaxed"
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                {stop.reason}
                              </p>
                            </div>
                            <div
                              className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                              style={{
                                borderColor: "var(--color-border-light)",
                                background: "rgba(251,191,36,0.08)",
                                color: "var(--color-text-primary)",
                              }}
                            >
                              ⭐ {averageRating.toFixed(1)} · {reviewCount}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <h4
                    className="mt-2 text-lg font-extrabold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {getOccasionTitle(occasionMode, activeCity.shortLabel)}
                  </h4>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {getOccasionHelper(occasionMode)} Cambia la ocasión y el concierge reordena el
                    plan sin pedirle nada extra al backend.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleCopyPlan}
                      className="flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all"
                      style={{
                        borderColor: "var(--color-border-light)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Copiar plan
                    </button>
                    <button
                      onClick={() => handleNavigateToPlace(plannedStops[0].place._id)}
                      className="flex-1 rounded-full px-4 py-2 text-sm font-bold transition-all"
                      style={{
                        background: "var(--gradient-button-primary)",
                        color: "var(--color-text-dark)",
                        boxShadow: "var(--shadow-amber-glow)",
                      }}
                    >
                      Abrir principal
                    </button>
                  </div>
                  <p
                    className="mt-3 text-[11px] leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Ruta sugerida para{" "}
                    <strong style={{ color: "var(--color-text-primary)" }}>
                      {occasionPreset.label}
                    </strong>{" "}
                    con {plannedStops.length} parada{plannedStops.length === 1 ? "" : "s"}{" "}
                    priorizada
                    {plannedStops.length === 1 ? "" : "s"}.
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
              >
                <InsightPill icon="🧭" label="Radar" value={activeMode.helper} />
                <InsightPill
                  icon="🌆"
                  label="Pulso"
                  value={
                    cityPulse
                      ? `${cityPulse.city} lidera con ${cityPulse.count} lugar${cityPulse.count === 1 ? "" : "es"}`
                      : "Activa un filtro y el pulso de la ciudad aparece aquí"
                  }
                />
                <InsightPill
                  icon="📸"
                  label="Visuales"
                  value={`${filteredStats.withPhotos} con foto para abrir el apetito cervecero`}
                />
                <InsightPill
                  icon="💛"
                  label="Guardados"
                  value={
                    savedInView
                      ? `${savedInView} guardado${savedInView === 1 ? "" : "s"} dentro de esta exploración`
                      : favoritos.length
                        ? `${favoritos.length} spot${favoritos.length === 1 ? "" : "s"} en tu colección personal`
                        : "Guarda tus hallazgos y arma tu próxima ruta"
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.26 }}
                className="rounded-[24px] border p-4 backdrop-blur-sm"
                style={{
                  background: "var(--color-surface-card)",
                  borderColor: "var(--color-border-subtle)",
                }}
              >
                <p
                  className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ¿Hay un lugar con historia que falta en el mapa?
                </p>
                <p
                  className="mt-2 text-sm leading-snug font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Si conoces una casona, taproom o bar de barrio que merece estar aquí, nóminalo. La
                  comunidad decide.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 w-full rounded-full border px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-text-primary)",
                    background: "rgba(251,191,36,0.04)",
                  }}
                >
                  {usuario ? "Agregar un nuevo lugar" : "Nominar un local"}
                </button>
              </motion.div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={slideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert severity="success" sx={{ bgcolor: "var(--color-amber-primary)", color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <PlaceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          setSnackbarMessage("Lugar agregado 🎉");
          setSnackbarOpen(true);
          fetchLugares();
        }}
        user={usuario}
      />
    </div>
  );
}
