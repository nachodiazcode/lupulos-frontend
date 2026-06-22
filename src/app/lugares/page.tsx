"use client";
import Image from "next/image";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
  Reorder,
} from "framer-motion";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  Button,
  Checkbox,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";
import { api } from "@/lib/api";

import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import LugaresBanner from "@/components/LugaresBanner";
import MapView from "@/features/lugares/components/MapView";
import PlaceDiscoveryGrid from "@/features/lugares/components/PlaceDiscoveryGrid";
import PlaceFormModal from "@/features/lugares/components/LugarFormModal";
import { SidebarWidget } from "@/components/ui/SidebarWidget";
import type { Place } from "@/features/lugares/types";
import type { Beer } from "@/features/beers/model/types";
import { getImageUrl } from "@/lib/constants";

const MOCK_PLACES: Place[] = [
  {
    _id: "mock-krossbar",
    name: "KrossBar Bellavista",
    description: "El clásico punto de encuentro en el corazón de Bellavista. Terraza amplia, excelente gastronomía cervecera y toda la variedad de salidas directas de barril de Kross.",
    coverImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80",
    address: {
      street: "Mallinkrodt 76",
      city: "Santiago",
      state: "Región Metropolitana",
      country: "Chile",
    },
    coordinates: {
      lat: -33.4348,
      lng: -70.6343,
    },
    hasTerrace: true,
    hasLiveMusic: false,
    isPetFriendly: true,
    isFeatured: true,
    likes: ["user1", "user2"],
    promotions: [
      {
        description: "15% dcto en todas las cervezas Kross de barril usando la app",
        discountPercent: 15
      }
    ],
    reviews: [
      { comment: "Excelente selección de cervezas de la casa y comida contundente.", rating: 5.0, user: { username: "CataCervecera" } },
      { comment: "La terraza es de las mejores de Santiago, muy buen ambiente.", rating: 4.8, user: { username: "PedroH" } },
      { comment: "Muy buena atención y rapidez. Recomendado Kross 5.", rating: 4.6, user: { username: "SofiG" } }
    ]
  },
  {
    _id: "mock-altamira",
    name: "Cervecería Altamira",
    description: "Ubicada a los pies del histórico ascensor Reina Victoria, Altamira celebra la tradición cervecera porteña en un espacio histórico con jazz en vivo, catas guiadas y cocina tradicional del puerto.",
    coverImage: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&auto=format&fit=crop&q=80",
    address: {
      street: "Elias 120",
      city: "Valparaíso",
      state: "Región de Valparaíso",
      country: "Chile",
    },
    coordinates: {
      lat: -33.0425,
      lng: -71.6265,
    },
    hasTerrace: false,
    hasLiveMusic: true,
    isPetFriendly: false,
    isFeatured: true,
    likes: ["user3"],
    promotions: [
      {
        description: "Happy Hour especial durante las sesiones de jazz en vivo",
        discountPercent: 20
      }
    ],
    reviews: [
      { comment: "Música increíble en un lugar cargado de historia. Las Stout son de otro planeta.", rating: 4.9, user: { username: "JazzLover" } },
      { comment: "Buena cerveza artesanal porteña. Las tablas de quesos combinan perfecto.", rating: 4.7, user: { username: "NicoV" } }
    ]
  },
  {
    _id: "mock-growler",
    name: "El Growler Brewpub",
    description: "Un rincón cervecero con fuerte identidad local e influencia norteamericana en Isla Teja. Comida casera y creativa, vibra de barrio inmejorable y growlers listos para recargar.",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    address: {
      street: "Saelzer 41",
      city: "Valdivia",
      state: "Región de Los Ríos",
      country: "Chile",
    },
    coordinates: {
      lat: -39.8183,
      lng: -73.2505,
    },
    hasTerrace: true,
    hasLiveMusic: true,
    isPetFriendly: true,
    isFeatured: false,
    likes: [],
    promotions: [],
    reviews: [
      { comment: "La mejor IPA de Valdivia por lejos. Y la atención es un 7.", rating: 4.9, user: { username: "ValdivianoRico" } },
      { comment: "Excelente ambiente frente al río en Isla Teja. Muy buenas opciones veganas.", rating: 4.5, user: { username: "SoleB" } }
    ]
  },
  {
    _id: "mock-cardumen",
    name: "Cardumen Surf & Beer",
    description: "El spot perfecto para relajarse después de surfear en Punta de Lobos. Cervezas locales de la Región de O'Higgins, hamburguesas ahumadas monumentales y fogatas al aire libre.",
    coverImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
    address: {
      street: "Av. Agustín Ross 320",
      city: "Pichilemu",
      state: "Región de O'Higgins",
      country: "Chile",
    },
    coordinates: {
      lat: -34.3872,
      lng: -72.0028,
    },
    hasTerrace: true,
    hasLiveMusic: false,
    isPetFriendly: true,
    isFeatured: false,
    likes: ["user1", "user5"],
    promotions: [
      {
        description: "2x1 en shop del día si vienes con tu tabla de surf 🏄‍♂️",
        discountPercent: 50
      }
    ],
    reviews: [
      { comment: "El ambiente surfer y las fogatas nocturnas hacen de este lugar algo mágico.", rating: 4.8, user: { username: "SurfBrew" } },
      { comment: "Hamburguesas mortales y cervezas heladas. Atención rápida y música de fondo de 10.", rating: 4.8, user: { username: "MatiasS" } }
    ]
  }
];


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

function LugarWidgetMetric({
  icon,
  value,
  label,
}: {
  icon: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex min-h-[72px] flex-col items-center justify-center rounded-[1rem] border px-2.5 py-2 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.035), color-mix(in srgb, var(--color-surface-card-alt) 52%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      <span
        className="mt-1 text-[15px] font-black leading-none"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </span>
      <span
        className="mt-1 text-[9px] font-semibold leading-none"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

function LugarWidgetEmptyState({
  icon,
  title,
  detail,
}: {
  icon: string;
  title: string;
  detail?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[1.25rem] border px-4 py-7 text-center"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
      }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-[1rem] border text-2xl"
        style={{
          background: "rgba(251,191,36,0.08)",
          borderColor: "rgba(251,191,36,0.18)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {icon}
      </span>
      <p
        className="mt-3 text-[13px] font-extrabold leading-snug"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </p>
      {detail ? (
        <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

const LUGARES_WIDGET_REGISTRY = [
  {
    id: "mapa",
    emoji: "🗺️",
    label: "Mapa vivo",
    description: "Cobertura, ciudad y acciones rápidas sobre el mapa.",
  },
  {
    id: "spotlight",
    emoji: "⭐",
    label: "Lugar destacado",
    description: "El spot mejor posicionado para abrir en un toque.",
  },
  {
    id: "concierge",
    emoji: "🧭",
    label: "Concierge",
    description: "Ruta sugerida según el tipo de salida.",
  },
  {
    id: "insights",
    emoji: "📊",
    label: "Insights",
    description: "Vibes, ciudades y distribución del catálogo.",
  },
  {
    id: "nominar",
    emoji: "📝",
    label: "Nominar lugar",
    description: "Candidatos de barrio y votación comunitaria.",
  },
] as const;

type LugarWidgetId = (typeof LUGARES_WIDGET_REGISTRY)[number]["id"];
const DEFAULT_LUGARES_WIDGETS: LugarWidgetId[] = ["mapa", "spotlight"];

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
  const [lugaresLoading, setLugaresLoading] = useState(true);
  const [usuario, setUsuario] = useState<{ _id: string; username: string } | null>(null);

  // --- Estados de negocio de barrio y reclamación ---
  const [beersCatalog, setBeersCatalog] = useState<Beer[]>([]);
  const [claimOpen, setClaimOpen] = useState(false);
  const [placeToClaim] = useState<Place | null>(null);
  const [claiming, setClaiming] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [placeToAdmin] = useState<Place | null>(null);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [promoDesc, setPromoDesc] = useState("");
  const [promoPct, setPromoPct] = useState<number>(0);
  const [selectedBeerIds, setSelectedBeerIds] = useState<string[]>([]);
  const [adminTab, setAdminTab] = useState(0);

  // Estado para el widget móvil activo
  const [mobileWidget, setMobileWidget] = useState<"none" | "mapa" | "concierge" | "insights" | "nominar">("none");

  // --- Estados de filtros de Vibe (Versión 2.0) ---
  const [filterTerrace, setFilterTerrace] = useState(false);
  const [filterLiveMusic, setFilterLiveMusic] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);

  // --- Estado de widgets interactivos ordenables ---
  const [enabledWidgets, setEnabledWidgets] = useState<LugarWidgetId[]>(DEFAULT_LUGARES_WIDGETS);
  const [collapsedWidgets, setCollapsedWidgets] = useState<LugarWidgetId[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // --- Estado de nominaciones comunitaria gamificada (Versión 2.0) ---
  const [mockNominations, setMockNominations] = useState([
    { _id: "n1", name: "Cervecería Barbudo", city: "Santiago", votes: 42, voted: false },
    { _id: "n2", name: "El Bar del Abuelo", city: "Valparaíso", votes: 19, voted: false },
    { _id: "n3", name: "Lúpulo Austral", city: "Concepción", votes: 31, voted: false },
  ]);

  const fetchBeers = async () => {
    try {
      const res = await api.get("/beer");
      setBeersCatalog(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("❌ Error al cargar catálogo de cervezas:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritos(favs);
    const user = localStorage.getItem("user");
    if (user) setUsuario(JSON.parse(user));
    fetchLugares();
    fetchBeers();

    const storedWidgets = localStorage.getItem("lugares_sidebar_widgets_v2");
    if (storedWidgets) {
      try {
        setEnabledWidgets(JSON.parse(storedWidgets) as LugarWidgetId[]);
      } catch {}
    }
    const storedCollapsed = localStorage.getItem("lugares_sidebar_collapsed_v2");
    if (storedCollapsed) {
      try {
        setCollapsedWidgets(JSON.parse(storedCollapsed) as LugarWidgetId[]);
      } catch {}
    }
  }, []);


  /*
  const handleClaimOpen = (place: Place) => {
    setPlaceToClaim(place);
    setClaimOpen(true);
  };

  const handleOpenAdmin = (place: Place) => {
    setPlaceToAdmin(place);
    setPromoDesc(place.promotions?.[0]?.description || "");
    setPromoPct(place.promotions?.[0]?.discountPercent || 0);
    setSelectedBeerIds(place.beers?.map((b) => b._id) || []);
    setAdminTab(0);
    setAdminOpen(true);
  };

  */

  const toggleFavorito = useCallback((id: string) => {
    setFavoritos((prevFavoritos) => {
      const nuevosFavoritos = prevFavoritos.includes(id)
        ? prevFavoritos.filter((fid) => fid !== id)
        : [...prevFavoritos, id];
      localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
      return nuevosFavoritos;
    });
  }, []);

  const addWidget = (id: LugarWidgetId) => {
    setEnabledWidgets((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("lugares_sidebar_widgets_v2", JSON.stringify(next));
      if (next.length === LUGARES_WIDGET_REGISTRY.length) setPickerOpen(false);
      return next;
    });
  };

  const removeWidget = (id: LugarWidgetId) => {
    setEnabledWidgets((prev) => {
      const next = prev.filter((w) => w !== id);
      localStorage.setItem("lugares_sidebar_widgets_v2", JSON.stringify(next));
      return next;
    });
  };

  const toggleCollapse = (id: LugarWidgetId) => {
    setCollapsedWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      localStorage.setItem("lugares_sidebar_collapsed_v2", JSON.stringify(next));
      return next;
    });
  };

  const handleClaimSubmit = async () => {
    if (!placeToClaim) return;
    setClaiming(true);
    try {
      await api.patch(`/location/${placeToClaim._id}/claim`);
      setSnackbarMessage("¡Local reclamado con éxito! Bienvenido a la red de Socios 👑");
      setSnackbarOpen(true);
      setClaimOpen(false);
      fetchLugares();
    } catch (error) {
      console.error("❌ Error al reclamar local:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setSnackbarMessage(err.response?.data?.message || "Ocurrió un error al reclamar el local");
      setSnackbarOpen(true);
    } finally {
      setClaiming(false);
    }
  };


  const handleAdminSave = async () => {
    if (!placeToAdmin) return;
    setSavingAdmin(true);
    try {
      const payload = {
        promotions: [
          {
            description: promoDesc,
            discountPercent: promoPct,
          },
        ],
        beers: selectedBeerIds,
      };
      await api.patch(`/location/${placeToAdmin._id}`, payload);
      setSnackbarMessage("¡Configuración de local guardada!");
      setSnackbarOpen(true);
      setAdminOpen(false);
      fetchLugares();
    } catch (error) {
      console.error("❌ Error al guardar admin:", error);
      setSnackbarMessage("Error al guardar la configuración");
      setSnackbarOpen(true);
    } finally {
      setSavingAdmin(false);
    }
  };

  const renderLugarWidget = (id: LugarWidgetId): React.ReactNode => {
    const meta = LUGARES_WIDGET_REGISTRY.find((w) => w.id === id)!;

    switch (id) {
      case "mapa": {
        const mapCoverage = filteredStats.total > 0 ? Math.round((filteredStats.withCoords / filteredStats.total) * 100) : 0;
        return (
          <SidebarWidget
            label={meta.label}
            collapsed={collapsedWidgets.includes("mapa")}
            onClose={() => removeWidget("mapa")}
            onToggleCollapse={() => toggleCollapse("mapa")}
          >
            <div
              className="relative overflow-hidden rounded-[1.25rem] border"
              style={{
                height: 174,
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-surface-card-alt) 82%, transparent), color-mix(in srgb, var(--color-surface-deepest) 92%, transparent))",
                borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <MapView places={lugaresFiltrados} selectedId={selectedId} onSelectPlace={handleSelectPlace} />

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-20"
                style={{ background: "linear-gradient(180deg, rgba(8,6,12,0.76) 0%, transparent 100%)" }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{ background: "linear-gradient(0deg, rgba(8,6,12,0.9) 0%, transparent 100%)" }}
              />

              <div
                className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                style={{
                  background: "rgba(8,6,12,0.7)",
                  borderColor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px) saturate(160%)",
                }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[10px] font-bold text-white">EN VIVO</span>
              </div>

              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <div
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    background: "rgba(8,6,12,0.7)",
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "var(--color-amber-primary)",
                    backdropFilter: "blur(12px) saturate(160%)",
                  }}
                >
                  {activeCity.shortLabel}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3 pb-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                    Radar activo
                  </p>
                  <p className="mt-0.5 truncate text-[17px] font-black leading-none text-white">
                    {filteredStats.withCoords}
                    <span className="ml-1 text-[11px] font-semibold text-white/62">lugares ubicables</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSurpriseMe}
                    className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                    style={{
                      background: "rgba(251,191,36,0.16)",
                      borderColor: "rgba(251,191,36,0.26)",
                      backdropFilter: "blur(12px)",
                      color: "var(--color-amber-primary)",
                    }}
                    title="Sorpréndeme"
                  >
                    🎲
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetDiscovery}
                    className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(12px)",
                      color: "white",
                    }}
                    title="Resetear filtros"
                  >
                    ↺
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <LugarWidgetMetric icon="📍" value={filteredStats.total} label="Lugares" />
              <LugarWidgetMetric icon="📸" value={filteredStats.withPhotos} label="Con foto" />
              <LugarWidgetMetric icon="🗺️" value={`${mapCoverage}%`} label="Cobertura" />
            </div>
          </SidebarWidget>
        );
      }

      case "spotlight": {
        if (lugaresLoading) {
          return (
            <SidebarWidget
              label={meta.label}
              collapsed={collapsedWidgets.includes("spotlight")}
              onClose={() => removeWidget("spotlight")}
              onToggleCollapse={() => toggleCollapse("spotlight")}
            >
              <div className="flex animate-pulse flex-col gap-3">
                <div className="h-28 rounded-[1.2rem] bg-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            </SidebarWidget>
          );
        }

        if (!spotlightPlace) {
          return (
            <SidebarWidget
              label={meta.label}
              collapsed={collapsedWidgets.includes("spotlight")}
              onClose={() => removeWidget("spotlight")}
              onToggleCollapse={() => toggleCollapse("spotlight")}
            >
              <LugarWidgetEmptyState
                icon="⭐"
                title="Sin lugar destacado aún"
                detail="Cuando aparezca un favorito de la comunidad, lo verás aquí."
              />
            </SidebarWidget>
          );
        }

        return (
          <SidebarWidget
            label={meta.label}
            collapsed={collapsedWidgets.includes("spotlight")}
            onClose={() => removeWidget("spotlight")}
            onToggleCollapse={() => toggleCollapse("spotlight")}
          >
            <div
              className="overflow-hidden rounded-[1.25rem] border transition-all duration-300"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.035), color-mix(in srgb, var(--color-surface-card-alt) 58%, transparent))",
                boxShadow: spotlightPlace.isFeatured
                  ? "0 12px 28px rgba(251,191,36,0.08), inset 0 0 24px rgba(251,191,36,0.06)"
                  : "inset 0 1px 0 rgba(255,255,255,0.06)",
                borderColor: spotlightPlace.isFeatured
                  ? "rgba(251,191,36,0.28)"
                  : "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
              }}
            >
              <div className="relative h-28 overflow-hidden">
                <motion.div
                  className="relative h-full w-full"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
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
                      className="flex h-full w-full items-center justify-center text-4xl"
                      style={{ background: "radial-gradient(circle at top, rgba(251,191,36,0.28), rgba(14,14,14,0.08) 42%), linear-gradient(135deg, rgba(120,53,15,0.85), rgba(41,24,16,0.96))" }}
                    >
                      🍻
                    </div>
                  )}
                </motion.div>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(8,6,12,0.05) 0%, rgba(8,6,12,0.3) 42%, rgba(8,6,12,0.92) 100%)",
                  }}
                />
                <div className="absolute top-2 left-2">
                  <div
                    className="rounded-full border px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.16em]"
                    style={{
                      borderColor: "rgba(255,255,255,0.18)",
                      background: "rgba(8,6,12,0.62)",
                      color: "white",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {selectedPlace ? "Selección" : "Destacado"}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div
                    className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[8.5px] font-bold"
                    style={{
                      borderColor: "rgba(255,255,255,0.18)",
                      background: "rgba(8,6,12,0.62)",
                      color: "white",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {spotlightPlace.isFeatured && <span className="text-[10px] animate-pulse">👑</span>}
                    <span>{spotlightSaved ? "Guardado" : spotlightPlace.isFeatured ? "Socio" : "Recomendado"}</span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                    {spotlightPlace.address.city}
                  </p>
                  <h3 className="mt-0.5 text-lg font-extrabold text-white leading-tight">{spotlightPlace.name}</h3>
                </div>
              </div>
              
              <motion.div
                key={spotlightPlace._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col p-3"
              >
                <p className="line-clamp-2 text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {getPlaceSnippet(spotlightPlace)}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {spotlightEmotionalLine}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <div className="rounded-full border px-2.5 py-1 text-[9px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", background: "rgba(251,191,36,0.08)", color: "var(--color-text-primary)" }}>
                    ⭐ {spotlightAverageRating.toFixed(1)}
                  </div>
                  <div className="rounded-full border px-2.5 py-1 text-[9px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", background: "rgba(255,255,255,0.035)", color: "var(--color-text-primary)" }}>
                    💬 {spotlightReviewCount} reseña{spotlightReviewCount === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigateToPlace(spotlightPlace._id)}
                    className="flex-1 rounded-xl py-2 text-[11px] font-bold transition-all"
                    style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                  >
                    Abrir lugar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.04)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPlace(spotlightPlace._id)}
                    className="rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all"
                    style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", color: "var(--color-text-primary)", background: "rgba(255,255,255,0.025)" }}
                  >
                    Centrar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </SidebarWidget>
        );
      }

      case "concierge": {
        if (plannedStops.length === 0) {
          return (
            <SidebarWidget
              label={meta.label}
              collapsed={collapsedWidgets.includes("concierge")}
              onClose={() => removeWidget("concierge")}
              onToggleCollapse={() => toggleCollapse("concierge")}
            >
              <LugarWidgetEmptyState
                icon="🧭"
                title="Sin paradas planificadas"
                detail="Prueba con otro filtro o deja que el mapa elija la primera parada."
              />
            </SidebarWidget>
          );
        }
        return (
          <SidebarWidget
            label={meta.label}
            collapsed={collapsedWidgets.includes("concierge")}
            onClose={() => removeWidget("concierge")}
            onToggleCollapse={() => toggleCollapse("concierge")}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {OCCASION_MODES.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOccasionMode(preset.value)}
                  className="min-h-[34px] rounded-xl border px-2.5 py-1 text-left text-[10px] font-bold transition-all"
                  style={{
                    borderColor: occasionMode === preset.value ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                    background: occasionMode === preset.value ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.025)",
                    color: occasionMode === preset.value ? "var(--color-amber-primary)" : "var(--color-text-primary)",
                    boxShadow: occasionMode === preset.value ? "0 0 14px rgba(251,191,36,0.08)" : "none",
                  }}
                >
                  {preset.icon} {preset.label}
                </motion.button>
              ))}
            </div>

            <div
              className="relative ml-2 mt-4 space-y-3 border-l pl-5"
              style={{ borderColor: "color-mix(in srgb, var(--color-amber-primary) 32%, transparent)" }}
            >
              {plannedStops.map((stop, idx) => {
                const averageRating = getAverageRating(stop.place);
                const isSelected = selectedId === stop.place._id;
                return (
                  <div key={`${stop.kind}-${stop.place._id}`} className="relative">
                    <div
                      className="absolute -left-[29px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[8.5px] font-bold transition-all"
                      style={{
                        background: isSelected ? "var(--gradient-button-primary)" : "var(--color-surface-mid)",
                        color: isSelected ? "var(--color-text-dark)" : "var(--color-text-secondary)",
                        border: `1.5px solid ${isSelected ? "var(--color-amber-primary)" : "var(--color-border-light)"}`,
                        boxShadow: isSelected ? "var(--shadow-amber-glow)" : "0 0 0 4px rgba(255,255,255,0.02)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    
                    <motion.button
                      whileHover={{ x: 2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectPlace(stop.place._id)}
                      className="w-full rounded-xl border p-2.5 text-left transition-all"
                      style={{
                        borderColor: isSelected ? "var(--color-amber-primary)" : "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
                        background: isSelected
                          ? "linear-gradient(180deg, rgba(251,191,36,0.1), rgba(251,191,36,0.035))"
                          : "rgba(255,255,255,0.025)",
                        boxShadow: isSelected ? "0 0 18px rgba(251,191,36,0.06)" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[8.5px] font-bold tracking-[0.14em] uppercase" style={{ color: isSelected ? "var(--color-amber-primary)" : "var(--color-text-muted)" }}>{stop.eyebrow}</p>
                          <p className="mt-0.5 truncate text-[12.5px] font-extrabold" style={{ color: "var(--color-text-primary)" }}>{stop.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-[var(--color-text-secondary)]">{stop.reason}</p>
                        </div>
                        <div className="shrink-0 rounded-full border px-1.5 py-0.5 text-[8.5px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", background: "rgba(251,191,36,0.06)", color: "var(--color-text-primary)" }}>
                          ⭐ {averageRating.toFixed(1)}
                        </div>
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </div>

            <h4 className="mt-3.5 text-[12.5px] font-extrabold" style={{ color: "var(--color-text-primary)" }}>
              {getOccasionTitle(occasionMode, activeCity.shortLabel)}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
              {getOccasionHelper(occasionMode)} Ruta optimizada en tiempo real.
            </p>
            <div className="mt-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyPlan}
                className="flex-1 rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all"
                style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)", color: "var(--color-text-primary)", background: "rgba(255,255,255,0.025)" }}
              >
                Copiar plan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigateToPlace(plannedStops[0].place._id)}
                className="flex-1 rounded-xl px-3 py-2 text-[11px] font-bold transition-all"
                style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
              >
                Abrir principal
              </motion.button>
            </div>
          </SidebarWidget>
        );
      }

      case "insights": {
        return (
          <SidebarWidget
            label={meta.label}
            collapsed={collapsedWidgets.includes("insights")}
            onClose={() => removeWidget("insights")}
            onToggleCollapse={() => toggleCollapse("insights")}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Vibe Radar
                </span>
                <span
                  className="rounded-full border px-2 py-0.5 text-[9px] font-bold"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
                    background: "rgba(255,255,255,0.025)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {cityPulse ? `${cityPulse.city} · ${cityPulse.count}` : `${filteredStats.total} en vista`}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { label: "☀️ Terraza al aire libre", active: filterTerrace, count: vibeCounts.terrace, toggle: () => setFilterTerrace(!filterTerrace) },
                  { label: "🎸 Música en vivo hoy", active: filterLiveMusic, count: vibeCounts.liveMusic, toggle: () => setFilterLiveMusic(!filterLiveMusic) },
                  { label: "🐾 Pet-Friendly", active: filterPetFriendly, count: vibeCounts.petFriendly, toggle: () => setFilterPetFriendly(!filterPetFriendly) },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={item.toggle}
                    className="flex min-h-[42px] w-full items-center justify-between rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all"
                    style={{
                      borderColor: item.active ? "var(--color-amber-primary)" : "var(--color-border-subtle)",
                      background: item.active
                        ? "linear-gradient(180deg, rgba(251,191,36,0.1), rgba(251,191,36,0.035))"
                        : "rgba(255,255,255,0.025)",
                      color: item.active ? "var(--color-amber-primary)" : "var(--color-text-primary)",
                      boxShadow: item.active ? "0 0 16px rgba(251,191,36,0.06)" : "none",
                    }}
                  >
                    <span>{item.label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{
                        background: item.active ? "var(--color-amber-primary)" : "rgba(255,255,255,0.055)",
                        color: item.active ? "var(--color-text-dark)" : "var(--color-text-secondary)",
                      }}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div
              className="mt-4 space-y-2 border-t pt-3"
              style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)" }}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Distribución Geográfica
              </span>
              {cityStats.length === 0 ? (
                <p className="py-2 text-center text-[10px] text-[var(--color-text-muted)]">
                  Sin locales en vista
                </p>
              ) : (
                <div className="space-y-2">
                  {cityStats.slice(0, 4).map((city) => (
                    <div
                      key={city.name}
                      className="rounded-xl border px-3 py-2"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                      }}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--color-text-primary)]">{city.name}</span>
                        <span className="font-bold text-[var(--color-text-muted)]">{city.count} spot{city.count === 1 ? "" : "s"}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${city.percentage}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "var(--gradient-button-primary)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SidebarWidget>
        );
      }

      case "nominar": {
        return (
          <SidebarWidget
            label={meta.label}
            collapsed={collapsedWidgets.includes("nominar")}
            onClose={() => removeWidget("nominar")}
            onToggleCollapse={() => toggleCollapse("nominar")}
          >
            <div
              className="rounded-[1.2rem] border p-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(255,255,255,0.025))",
                borderColor: "color-mix(in srgb, var(--color-border-amber) 36%, var(--color-border-light))",
              }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-muted)" }}>
                ¿Falta una joya?
              </p>
              <p className="mt-1 text-[13px] font-extrabold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                Suma ese bar de barrio, casona o taproom que merece aparecer en el mapa.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalOpen(true)}
              className="mt-3 w-full rounded-xl px-3 py-2 text-[11px] font-bold transition-all"
              style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
            >
              {usuario ? "Agregar un nuevo lugar" : "Nominar un local"}
            </motion.button>

            <div
              className="mt-4 space-y-2 border-t pt-3"
              style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)" }}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Candidatos del Barrio
              </span>
              <div className="space-y-2">
                {mockNominations.map((nom) => (
                  <motion.div
                    key={nom._id}
                    whileHover={{ y: -1, backgroundColor: "rgba(255,255,255,0.04)" }}
                    className="flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all"
                    style={{
                      background: nom.voted ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                      borderColor: nom.voted
                        ? "rgba(34,197,94,0.24)"
                        : "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                    }}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate font-extrabold text-[var(--color-text-primary)]">{nom.name}</p>
                      <p className="mt-0.5 text-[9px] text-[var(--color-text-muted)]">{nom.city}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                          background: "rgba(255,255,255,0.035)",
                          color: "var(--color-amber-primary)",
                        }}
                      >
                        {nom.votes}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          setMockNominations((prev) =>
                            prev.map((n) => {
                              if (n._id === nom._id) {
                                return {
                                  ...n,
                                  votes: n.voted ? n.votes - 1 : n.votes + 1,
                                  voted: !n.voted,
                                };
                              }
                              return n;
                            })
                          );
                        }}
                        className="rounded-xl px-2.5 py-1 text-[9px] font-bold transition-all"
                        style={{
                          background: nom.voted ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.12)",
                          color: nom.voted ? "#4ade80" : "var(--color-amber-primary)",
                          border: `1px solid ${nom.voted ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.2)"}`,
                        }}
                      >
                        {nom.voted ? "Votado" : "Votar"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div
                className="mt-3 rounded-xl border p-2.5"
                style={{
                  background: "linear-gradient(90deg, rgba(16,185,129,0.09), rgba(20,184,166,0.07))",
                  borderColor: "rgba(16,185,129,0.22)",
                }}
              >
                <div className="flex items-center justify-between text-[8.5px] font-bold uppercase tracking-[0.14em] text-emerald-400">
                  <span>Meta de expansión</span>
                  <span>{mockNominations.reduce((acc, n) => acc + n.votes, 0)} / 150 votos</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/80">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min((mockNominations.reduce((acc, n) => acc + n.votes, 0) / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </SidebarWidget>
        );
      }

      default:
        return null;
    }
  };

  const fetchLugares = async () => {
    setLugaresLoading(true);
    try {
      const res = await api.get(`/location`);
      const lugaresData = Array.isArray(res.data.data) ? res.data.data : [];
      if (lugaresData.length === 0) {
        setLugares(MOCK_PLACES);
      } else {
        setLugares(lugaresData.reverse());
      }
    } catch (error) {
      console.error("❌ Error al obtener lugares, usando mock fallback:", error);
      setLugares(MOCK_PLACES);
    } finally {
      setLugaresLoading(false);
    }
  };


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

      const matchTerrace = filterTerrace ? Boolean(lugar.hasTerrace) : true;
      const matchLiveMusic = filterLiveMusic ? Boolean(lugar.hasLiveMusic) : true;
      const matchPetFriendly = filterPetFriendly ? Boolean(lugar.isPetFriendly) : true;

      return matchSearch && matchCity && matchMode && matchTerrace && matchLiveMusic && matchPetFriendly;
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
  }, [lugares, searchQuery, cityFilter, discoveryMode, favoritos, filterTerrace, filterLiveMusic, filterPetFriendly]);


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

  // --- Cálculos de Insights (Versión 2.0) ---
  const vibeCounts = useMemo(() => {
    const visible = lugaresFiltrados.length ? lugaresFiltrados : lugares;
    return {
      terrace: visible.filter((l) => l.hasTerrace).length,
      liveMusic: visible.filter((l) => l.hasLiveMusic).length,
      petFriendly: visible.filter((l) => l.isPetFriendly).length,
    };
  }, [lugaresFiltrados, lugares]);

  const cityStats = useMemo(() => {
    const countsMap = new Map<string, number>();
    const visible = lugaresFiltrados.length ? lugaresFiltrados : lugares;
    visible.forEach((l) => {
      const city = l.address?.city?.trim();
      if (!city) return;
      countsMap.set(city, (countsMap.get(city) ?? 0) + 1);
    });
    
    const sorted = [...countsMap.entries()].sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({
      name,
      count,
      percentage: (count / max) * 100,
    }));
  }, [lugaresFiltrados, lugares]);

  const handleSurpriseMe = useCallback(() => {
    if (lugaresFiltrados.length === 0) return;
    const randomPlace = lugaresFiltrados[Math.floor(Math.random() * lugaresFiltrados.length)];
    setSelectedId(randomPlace._id);
  }, [lugaresFiltrados]);

  const resetDiscovery = useCallback(() => {
    setSearchQuery("");
    setCityFilter("");
    setDiscoveryMode("all");
    setFilterTerrace(false);
    setFilterLiveMusic(false);
    setFilterPetFriendly(false);
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery ||
    cityFilter ||
    discoveryMode !== "all" ||
    filterTerrace ||
    filterLiveMusic ||
    filterPetFriendly
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

    // Auto-seleccionar por URL id si existe
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id");
      if (urlId && lugaresFiltrados.some((lugar) => lugar._id === urlId)) {
        if (selectedId !== urlId) {
          setSelectedId(urlId);
          return;
        }
      }
    }

    if (!selectedId || !lugaresFiltrados.some((lugar) => lugar._id === selectedId)) {
      setSelectedId(lugaresFiltrados[0]._id);
    }
  }, [lugaresFiltrados, selectedId]);

  if (!mounted) return null;

  return (
    <MainLayout
      maxWidth="calc(1140px + 4rem)"
      topBanner={<LugaresBanner places={lugares} />}
      stickySidebar={false}
      title="Tu próxima salida empieza"
      titleGradientText="aquí."
      titleGradient="var(--gradient-heading)"
      subtitle="Bares, taprooms y cervecerías curados por la comunidad."
      sidebar={
        <div className="flex flex-col gap-3.5 pr-1">
          {/* Floating header row */}
          <div className="flex items-center justify-between px-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-secondary)" }}>Mis widgets</span>
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
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ border: "1px solid color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))" }} aria-hidden="true" />

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

                  <div className="p-3 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {LUGARES_WIDGET_REGISTRY.filter((w) => !enabledWidgets.includes(w.id)).map((w) => (
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
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border leading-none"
                            style={{
                              borderColor: "rgba(255,255,255,0.06)",
                              background: "rgba(255,255,255,0.045)",
                              fontSize: "18px",
                            }}
                          >
                            {w.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold" style={{ color: "var(--color-text-primary)", fontSize: "11px" }}>{w.label}</span>
                            <span className="mt-0.5 block line-clamp-2 text-[9.5px] leading-snug" style={{ color: "var(--color-text-muted)" }}>{w.description}</span>
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            onClick={() => { addWidget(w.id); }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold"
                            style={{ fontSize: "13px", background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                            aria-label={`Agregar ${w.label}`}
                          >
                            +
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {LUGARES_WIDGET_REGISTRY.every((w) => enabledWidgets.includes(w.id)) && (
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
              localStorage.setItem("lugares_sidebar_widgets_v2", JSON.stringify(newOrder));
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
                  {renderLugarWidget(id)}
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
              <span style={{ fontSize: "30px" }}>📍</span>
              <p className="mt-2 font-medium" style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Sin widgets activos</p>
            </motion.div>
          )}

          {/* Agregar widget button */}
          {LUGARES_WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
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
      }
    >
      {/* ─── Search and Filters at top of Feed ─── */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Search Input Card */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-amber-primary)]">🔍 Buscar</span>
          </div>
          <div className="mt-3">
            <GradientBorder active={searchFocused} radius={12} borderWidth={1.5}>
              <div className="flex items-center gap-3 rounded-[10.5px] px-4 py-2.5 bg-[var(--color-surface-card)]">
                <MagicMapIcon active={searchFocused} />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full bg-transparent text-sm outline-none text-[var(--color-text-primary)]"
                  />
                  {!searchQuery && (
                    <div className="pointer-events-none absolute inset-0 flex items-center text-sm text-[var(--color-text-muted)]">
                      <span>{typedPlaceholder}</span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                        className="ml-px inline-block h-4 w-[2px] rounded-full bg-[var(--color-amber-primary)]"
                      />
                    </div>
                  )}
                </div>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-xs text-[var(--color-text-muted)] transition-colors">
                    ✕
                  </button>
                )}
              </div>
            </GradientBorder>
          </div>

          {/* City Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CITY_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setCityFilter(chip.value)}
                className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all"
                style={{
                  borderColor: cityFilter === chip.value ? "var(--color-amber-primary)" : "var(--color-border-light)",
                  color: cityFilter === chip.value ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  background: cityFilter === chip.value ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.02)",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Vibe / Attribute Filters (Versión 2.0) */}
          <div className="mt-3 pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-2">
            {[
              { label: "☀️ Terraza", active: filterTerrace, toggle: () => setFilterTerrace(!filterTerrace) },
              { label: "🎸 En vivo", active: filterLiveMusic, toggle: () => setFilterLiveMusic(!filterLiveMusic) },
              { label: "🐾 Pet-Friendly", active: filterPetFriendly, toggle: () => setFilterPetFriendly(!filterPetFriendly) },
            ].map((vibe) => (
              <button
                key={vibe.label}
                onClick={vibe.toggle}
                className="rounded-full border px-3 py-1 text-xs font-semibold transition-all flex items-center gap-1 hover:brightness-105"
                style={{
                  borderColor: vibe.active ? "var(--color-amber-primary)" : "var(--color-border-light)",
                  color: vibe.active ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  background: vibe.active ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.02)",
                  boxShadow: vibe.active ? "var(--shadow-amber-glow)" : "none",
                }}
              >
                {vibe.label}
                {vibe.active && <span className="text-[10px] font-bold text-[var(--color-amber-primary)]">✓</span>}
              </button>
            ))}
          </div>

          {/* Filters Quick Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSurpriseMe}
              className="flex-1 rounded-full py-2 text-xs font-bold transition-all bg-[var(--gradient-button-primary)] text-[var(--color-text-dark)] shadow-[var(--shadow-amber-glow)] hover:brightness-105"
            >
              🎲 Sorpréndeme
            </button>
            <button
              onClick={resetDiscovery}
              disabled={!hasActiveFilters}
              className="rounded-full border px-4 py-2 text-xs font-semibold transition-all text-[var(--color-text-primary)] border-[var(--color-border-light)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Limpiar
            </button>
          </div>
        </div>



        {/* Mobile Widget Toggles */}
        <div className="flex xl:hidden gap-2 overflow-x-auto pb-1 shrink-0" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setMobileWidget(prev => prev === "mapa" ? "none" : "mapa")}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            style={{
              background: mobileWidget === "mapa" ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.04)",
              border: mobileWidget === "mapa" ? "1px solid var(--color-amber-primary)" : "1px solid var(--color-border-light)",
              color: mobileWidget === "mapa" ? "var(--color-amber-primary)" : "var(--color-text-primary)"
            }}
          >
            🗺️ {mobileWidget === "mapa" ? "Ocultar Mapa" : "Ver Mapa"}
          </button>
          <button
            onClick={() => setMobileWidget(prev => prev === "concierge" ? "none" : "concierge")}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            style={{
              background: mobileWidget === "concierge" ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.04)",
              border: mobileWidget === "concierge" ? "1px solid var(--color-amber-primary)" : "1px solid var(--color-border-light)",
              color: mobileWidget === "concierge" ? "var(--color-amber-primary)" : "var(--color-text-primary)"
            }}
          >
            🧭 {mobileWidget === "concierge" ? "Ocultar Concierge" : "Concierge"}
          </button>
          <button
            onClick={() => setMobileWidget(prev => prev === "insights" ? "none" : "insights")}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            style={{
              background: mobileWidget === "insights" ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.04)",
              border: mobileWidget === "insights" ? "1px solid var(--color-amber-primary)" : "1px solid var(--color-border-light)",
              color: mobileWidget === "insights" ? "var(--color-amber-primary)" : "var(--color-text-primary)"
            }}
          >
            📊 Insights
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--color-border-light)",
              color: "var(--color-text-primary)"
            }}
          >
            📝 Nominar
          </button>
        </div>

        {/* Mobile Widget Panel */}
        <AnimatePresence>
          {mobileWidget !== "none" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden w-full overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] mb-3"
            >
              {renderLugarWidget(mobileWidget)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Call to Action: Nominar lugar favorito (banner sobre la lista) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative mb-6 flex flex-col items-center gap-4 overflow-hidden rounded-[1.5rem] border p-5 text-center sm:flex-row sm:gap-5 sm:p-6 sm:text-left"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(255,255,255,0.01) 100%)",
          borderColor: "color-mix(in srgb, var(--color-border-amber) 36%, var(--color-border-light))",
          boxShadow: "var(--shadow-card)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-20 left-10 h-48 w-48 rounded-full bg-amber-500/5 blur-[80px]" />

        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          📍
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold leading-tight text-[var(--color-text-primary)]">
            ¿No has subido tu lugar favorito?
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Colabora con la comunidad nominando ese bar de barrio, casona o taproom que merece estar en el radar de Lúpulos.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, filter: "brightness(1.08)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold"
          style={{
            background: "var(--gradient-button-primary)",
            color: "var(--color-text-dark)",
            boxShadow: "var(--shadow-amber-glow)",
          }}
        >
          <span>Nominar un local</span>
          <span>→</span>
        </motion.button>
      </motion.div>

      {/* ─── Results header ─── */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold leading-tight text-[var(--color-text-primary)]">
            {hasActiveFilters ? "Lugares que calzan con tu búsqueda" : "Explora el mapa cervecero"}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
            {lugaresLoading
              ? "Cargando lugares…"
              : `${lugaresFiltrados.length} ${lugaresFiltrados.length === 1 ? "lugar" : "lugares"} en ${activeCity.shortLabel}`}
          </p>
        </div>
        {hasActiveFilters && !lugaresLoading && (
          <button
            onClick={resetDiscovery}
            className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] border-[var(--color-border-light)] transition-all hover:bg-white/5"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ─── Places grid ─── */}
      <div className="mb-8">
        {lugaresLoading ? (
          <div
            className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-[1.75rem] border px-6 py-10 text-center"
            style={{
              background: "color-mix(in srgb, var(--color-surface-card) 72%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
            }}
          >
            <CircularProgress size={30} sx={{ color: "var(--color-amber-primary)" }} aria-label="Cargando lugares" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Cargando lugares…</p>
            <p className="max-w-sm text-xs text-[var(--color-text-muted)]">
              Estamos sirviendo el listado de bares, taprooms y cervecerías.
            </p>
          </div>
        ) : (
          <PlaceDiscoveryGrid
            places={lugaresFiltrados}
            selectedId={selectedId}
            favoritos={favoritos}
            onSelect={handleSelectPlace}
            onToggleFavorito={toggleFavorito}
            onNavigate={handleNavigateToPlace}
            usuario={usuario}
          />
        )}
      </div>

      <Footer />

      {/* ─── MODAL DE RECLAMACIÓN ─── */}
      <Dialog
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(15,23,42,0.95) !important",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.5rem",
            color: "white",
            p: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.3rem" }}>
          📢 Reclamar Local Cervecero
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Estás a punto de reclamar la propiedad de{" "}
            <strong style={{ color: "white" }}>{placeToClaim?.name}</strong>.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--color-amber-primary)" }}>
              🔒 BENEFICIOS DE SOCIO PREMIUM:
            </Typography>
            <ul style={{ paddingLeft: 16, marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.85)", listStyleType: "disc" }}>
              <li style={{ marginBottom: 4 }}>Administra tu carta de cervezas pinchadas (on tap).</li>
              <li style={{ marginBottom: 4 }}>Publica promociones y happy hours activos.</li>
              <li style={{ marginBottom: 4 }}>Badge dorado de Socio Lúpulos en el mapa y radar.</li>
            </ul>
          </Box>

          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)", mt: 3 }}>
            * Al confirmar el reclamo te vincularás como administrador principal de este local.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setClaimOpen(false)}
            sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClaimSubmit}
            disabled={claiming}
            sx={{
              background: "var(--gradient-button-primary)",
              color: "var(--color-text-dark)",
              fontWeight: 800,
              textTransform: "none",
              px: 3,
              borderRadius: 99,
              boxShadow: "var(--shadow-amber-glow)",
              "&:hover": {
                background: "var(--gradient-button-primary)",
                filter: "brightness(1.05)",
              },
              "&.Mui-disabled": {
                background: "rgba(251,191,36,0.3)",
                color: "rgba(0,0,0,0.3)",
              },
            }}
          >
            {claiming ? <CircularProgress size={20} color="inherit" /> : "Confirmar Reclamo 👑"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MODAL DE ADMINISTRACIÓN ─── */}
      <Dialog
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(15,23,42,0.95) !important",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.5rem",
            color: "white",
            p: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.3rem" }}>
          ⚙️ Administrar Local: {placeToAdmin?.name}
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={adminTab}
            onChange={(_, val) => setAdminTab(val)}
            sx={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              "& .MuiTabs-indicator": { backgroundColor: "var(--color-amber-primary)" },
              "& .MuiTab-root": { color: "rgba(255,255,255,0.5)", textTransform: "none", fontWeight: 700 },
              "& .MuiTab-root.Mui-selected": { color: "var(--color-amber-primary)" },
            }}
          >
            <Tab label="🔥 Promociones (Happy Hour)" />
            <Tab label="🍻 Cervezas On Tap" />
          </Tabs>

          {/* TAB: PROMOCIONES */}
          {adminTab === 0 && (
            <Box sx={{ py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                Publica un happy hour o descuento exclusivo para atraer clientes a tu local en tiempo real.
              </Typography>

              <TextField
                label="Descripción de la promoción"
                multiline
                rows={2}
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                placeholder="Ej. Happy Hour 2x1 en IPAs seleccionadas de 18:00 a 20:00"
                fullWidth
                variant="outlined"
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.5)" } }}
                InputProps={{
                  style: { color: "white", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 12 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                    "&:hover fieldset": { borderColor: "var(--color-amber-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-amber-primary)" },
                  },
                }}
              />

              <TextField
                label="Porcentaje de descuento"
                type="number"
                value={promoPct || ""}
                onChange={(e) => setPromoPct(Number(e.target.value))}
                placeholder="Ej. 50"
                fullWidth
                variant="outlined"
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.5)" } }}
                InputProps={{
                  style: { color: "white", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 12 },
                  inputProps: { min: 0, max: 100 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                    "&:hover fieldset": { borderColor: "var(--color-amber-primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-amber-primary)" },
                  },
                }}
              />
            </Box>
          )}

          {/* TAB: BEERS ON TAP */}
          {adminTab === 1 && (
            <Box sx={{ py: 3 }}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)", mb: 2 }}>
                Selecciona las cervezas artesanales del catálogo de Lúpulos que tienes pinchadas en barra en este momento.
              </Typography>

              <Box sx={{ maxHeight: 280, overflowY: "auto", pr: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, p: 1.5, bg: "rgba(0,0,0,0.1)" }}>
                {beersCatalog.length === 0 ? (
                  <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", py: 4 }}>
                    No hay cervezas registradas en el catálogo.
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {beersCatalog.map((beer) => {
                      const isChecked = selectedBeerIds.includes(beer._id);
                      return (
                        <ListItem
                          key={beer._id}
                          disablePadding
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBeerIds((prev) => [...prev, beer._id]);
                                } else {
                                  setSelectedBeerIds((prev) => prev.filter((id) => id !== beer._id));
                                }
                              }}
                              sx={{
                                color: "rgba(251,191,36,0.3)",
                                "&.Mui-checked": {
                                  color: "var(--color-amber-primary)",
                                },
                              }}
                            />
                          }
                          sx={{
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            "&:last-child": { border: "none" },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                {beer.name}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                {beer.brewery} · {beer.style} · {beer.abv}% ABV
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAdminOpen(false)}
            sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdminSave}
            disabled={savingAdmin}
            sx={{
              background: "var(--gradient-button-primary)",
              color: "var(--color-text-dark)",
              fontWeight: 800,
              textTransform: "none",
              px: 3,
              borderRadius: 99,
              boxShadow: "var(--shadow-amber-glow)",
              "&:hover": {
                background: "var(--gradient-button-primary)",
                filter: "brightness(1.05)",
              },
              "&.Mui-disabled": {
                background: "rgba(251,191,36,0.3)",
                color: "rgba(0,0,0,0.3)",
              },
            }}
          >
            {savingAdmin ? <CircularProgress size={20} color="inherit" /> : "Guardar Cambios 🍻"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR DE NOTIFICACIONES */}
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

      {/* FORMULARIO DE NOMINACIÓN */}
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
    </MainLayout>
  );
}
