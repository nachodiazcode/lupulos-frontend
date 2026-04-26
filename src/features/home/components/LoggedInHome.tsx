"use client";

import { useEffect, useMemo, useRef, useState, type PointerEventHandler } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  Reorder,
  useMotionValue,
  useTransform,
  useDragControls,
  animate as fmAnimate,
} from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenParticles from "@/features/landing/components/GoldenParticles";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import { getDisplayName, getStoredToken, persistAuthSession } from "@/lib/auth-storage";
import {
  DEFAULT_PROFILE_STATS,
  extractApiData,
  normalizeProfilePayload,
  normalizeStoredAuthUser,
  type ProfileStats,
} from "@/lib/auth-user";
import {
  MAX_VIDEO_DURATION_SECONDS,
  extractUploadedMediaList,
  getPostMediaList,
  readVideoDurationSeconds,
  type PostMedia,
} from "@/lib/post-media";
import { HOME_FEED_MAX_WIDTH } from "./homeFeed.constants";

interface Usuario {
  _id?: string;
  id?: string;
  username?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
}

interface Post {
  _id?: string;
  id?: string;
  titulo?: string;
  title?: string;
  contenido?: string;
  content?: string;
  imagenes?: string[];
  images?: string[];
  media?: PostMedia[];
  multimedia?: PostMedia[];
  usuario?: Usuario;
  author?: Usuario;
  createdAt?: string;
  updatedAt?: string;
  reacciones?: {
    meGusta?: { count: number; usuarios: string[] };
  };
  reactions?: {
    like?: { count: number; users: string[] };
  };
}

interface FeedSeed {
  id: string;
  title: string;
  body: string;
  image: string;
  mediaType: "image" | "video" | null;
  mediaList: Array<{ url: string; type: "image" | "video" | null }>;
  author: string;
  likes: number;
  likedByUsers: string[];
  createdAt: string;
  route: string;
  kicker: string;
  mood: string;
}

interface FeedCommentApi {
  _id?: string;
  id?: string;
  comentario?: string;
  content?: string;
  usuario?: Usuario;
  author?: Usuario;
}

interface FeedReply {
  id: string;
  author: string;
  text: string;
}

interface FeedComment {
  id: string;
  author: string;
  text: string;
  replies: FeedReply[];
  source: "seed" | "server" | "local";
}

interface HomeBeer {
  _id?: string;
  name?: string;
  brewery?: string;
  style?: string;
  beerStyle?: string;
  description?: string;
  averageRating?: number;
}

interface HomePlace {
  _id?: string;
  name?: string;
  description?: string;
  averageRating?: number;
  address?: {
    city?: string;
  };
}

interface StylePulseItem {
  icon: string;
  name: string;
  note: string;
}

interface RouteSpotItem {
  icon: string;
  title: string;
  detail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractListFromPayload<T>(payload: unknown, fallbackKeys: string[] = []): T[] {
  const data = extractApiData<unknown>(payload);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data)) {
    for (const key of fallbackKeys) {
      if (Array.isArray(data[key])) {
        return data[key] as T[];
      }
    }
  }

  if (isRecord(payload)) {
    for (const key of fallbackKeys) {
      if (Array.isArray(payload[key])) {
        return payload[key] as T[];
      }
    }
  }

  return [];
}

function extractTotalFromPayload(payload: unknown): number | null {
  if (!isRecord(payload) || !isRecord(payload.meta)) return null;

  const total = Number(payload.meta.total);
  return Number.isFinite(total) ? total : null;
}

function truncateCopy(value: string, limit = 78): string {
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).trimEnd()}...`;
}

const countFormatter = new Intl.NumberFormat("es-CL");

function formatCount(value: number): string {
  return countFormatter.format(Math.max(0, Math.round(value)));
}

function getBeerStyleIcon(style: string): string {
  const normalized = style.toLowerCase();

  if (normalized.includes("stout") || normalized.includes("porter")) return "🖤";
  if (normalized.includes("sour")) return "🍋";
  if (normalized.includes("lager") || normalized.includes("pils")) return "🌾";
  if (normalized.includes("amber") || normalized.includes("red")) return "🧡";
  if (normalized.includes("ipa")) return normalized.includes("west") ? "🌲" : "🌫️";

  return "🍺";
}

function mapBeersToStylePulse(beers: HomeBeer[]): StylePulseItem[] {
  if (!beers.length) return STYLE_PULSE;

  return beers.slice(0, 4).map((beer) => {
    const style = beer.beerStyle || beer.style || beer.name || "Descubrimiento cervecero";
    const brewery = beer.brewery?.trim();
    const rating =
      typeof beer.averageRating === "number" && beer.averageRating > 0
        ? ` · ${beer.averageRating.toFixed(1)}★`
        : "";
    const meta = [beer.name?.trim(), brewery].filter(Boolean).join(" · ");
    const note = truncateCopy(beer.description || `${meta || style}${rating}`, 86);

    return {
      icon: getBeerStyleIcon(style),
      name: style,
      note: note || "Lo que la comunidad esta mirando con ganas de otra ronda.",
    };
  });
}

function mapPlacesToRoutes(places: HomePlace[]): RouteSpotItem[] {
  if (!places.length) return ROUTES;

  return places.slice(0, 3).map((place) => {
    const city = place.address?.city?.trim();
    const rating =
      typeof place.averageRating === "number" && place.averageRating > 0
        ? ` · ${place.averageRating.toFixed(1)}★`
        : "";
    const detail = truncateCopy(
      [city, place.description?.trim()].filter(Boolean).join(" · ") ||
        `hallazgo listo para salir${rating}`,
      90,
    );

    return {
      icon: "📍",
      title: place.name?.trim() || "Taproom recomendado",
      detail: detail || `plan con buena pinta${rating}`,
    };
  });
}

function buildLevelProgress(stats: ProfileStats) {
  const totalXp =
    stats.posts * 40 +
    stats.beers * 32 +
    stats.places * 36 +
    stats.followers * 18 +
    stats.following * 6;
  const xpPerLevel = 500;
  const level = Math.max(1, Math.floor(totalXp / xpPerLevel) + 1);
  const xpIntoLevel = totalXp - (level - 1) * xpPerLevel;
  const rankNames = ["Lupulero", "Catador", "Explorador", "Maestro Cervecero", "Leyenda"];
  const rankName = rankNames[Math.min(level - 1, rankNames.length - 1)];

  return {
    level,
    rankName,
    currentXp: xpIntoLevel,
    targetXp: xpPerLevel,
    progressPercent: Math.max(0, Math.min(100, (xpIntoLevel / xpPerLevel) * 100)),
  };
}

const QUICK_ACTIONS = [
  { icon: "🍺", label: "Descubrir una cerveza ahora", href: "/cervezas" },
  { icon: "📍", label: "Armar una salida cervecera", href: "/lugares" },
  { icon: "💬", label: "Meterme al ruido del muro", href: "/posts" },
  { icon: "🤖", label: "Pedirle una recomendación a la IA", href: "/chat" },
];

const STYLE_PULSE = [
  { icon: "🌫️", name: "Hazy IPA", note: "la jugosa que convierte un vistazo en una segunda pinta" },
  {
    icon: "🖤",
    name: "Imperial Stout",
    note: "oscura, cremosa y demasiado buena para cerrar el scroll",
  },
  { icon: "🍋", name: "Sour cítrica", note: "afilada, frutal y perfecta para mandar por WhatsApp" },
  { icon: "🌲", name: "West Coast IPA", note: "seca, resinosa y con esa amargura que engancha" },
];

const ROUTES = [
  {
    icon: "📍",
    title: "Ruta taproom Santiago",
    detail: "cuatro paradas para salir con la primera cerveza ya decidida",
  },
  {
    icon: "🌊",
    title: "Valpo de pintas largas",
    detail: "barras con vista, conversación y ganas de quedarse otra ronda",
  },
  {
    icon: "🍔",
    title: "Maridajes para burger night",
    detail: "combinaciones que hacen que la mesa pida una segunda vuelta",
  },
];

const HOME_WIDGET_STORAGE_KEY = "home_loggedin_widgets_v1";
const HOME_WIDGET_COLLAPSED_STORAGE_KEY = "home_loggedin_widgets_collapsed_v1";

const HOME_WIDGET_REGISTRY = [
  {
    id: "style-pulse",
    label: "Ruido",
    description: "Estilos que hoy están atrapando más miradas.",
  },
  {
    id: "routes",
    label: "Salir",
    description: "Planes y rutas listas para pasar del scroll a la calle.",
  },
  {
    id: "level",
    label: "Nivel",
    description: "Tu progreso dentro de la comunidad cervecera.",
  },
  {
    id: "momentum",
    label: "Pulso",
    description: "Actividad viva del home para leerlo en un vistazo.",
  },
] as const;

type HomeWidgetId = (typeof HOME_WIDGET_REGISTRY)[number]["id"];

const DEFAULT_HOME_WIDGETS: HomeWidgetId[] = ["style-pulse", "routes", "level"];
const HOME_WIDGET_IDS = HOME_WIDGET_REGISTRY.map((widget) => widget.id);

/* ── Right-side widgets ── */
const RIGHT_WIDGET_REGISTRY = [
  { id: "trending", label: "Tendencias", description: "Estilos que hoy están atrapando más miradas." },
  { id: "rw-places", label: "Lugares", description: "Spots y rutas listos para salir del scroll." },
  { id: "rw-level", label: "Mi nivel", description: "Tu rango y progreso en la comunidad." },
  { id: "rw-pulse", label: "Pulso", description: "Actividad viva del muro en un vistazo." },
] as const;

type RightWidgetId = (typeof RIGHT_WIDGET_REGISTRY)[number]["id"];
const RIGHT_WIDGET_IDS = RIGHT_WIDGET_REGISTRY.map((w) => w.id);
const DEFAULT_RIGHT_WIDGETS: RightWidgetId[] = ["trending"];
const RIGHT_WIDGET_STORAGE_KEY = "home_right_widgets_v1";
const RIGHT_WIDGET_COLLAPSED_STORAGE_KEY = "home_right_widgets_collapsed_v1";

function isRightWidgetId(value: unknown): value is RightWidgetId {
  return typeof value === "string" && RIGHT_WIDGET_IDS.includes(value as RightWidgetId);
}

function sanitizeRightWidgetIds(value: unknown): RightWidgetId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<RightWidgetId>();
  return value.filter((id): id is RightWidgetId => {
    if (!isRightWidgetId(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

const FEED_PAGE_SIZE = 8;
const LOAD_MORE_THRESHOLD_PX = 1200;

function isHomeWidgetId(value: unknown): value is HomeWidgetId {
  return typeof value === "string" && HOME_WIDGET_IDS.includes(value as HomeWidgetId);
}

function sanitizeHomeWidgetIds(value: unknown): HomeWidgetId[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<HomeWidgetId>();
  return value.filter((id): id is HomeWidgetId => {
    if (!isHomeWidgetId(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function timeAgo(dateString: string): string {
  if (!dateString) return "recién";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes}min`;
  return "ahora";
}

function getPostId(post: Post): string {
  return post._id || post.id || "";
}

function getPostKey(post: Post, index = 0): string {
  return (
    getPostId(post) ||
    `${getPostTitle(post) || "post"}-${post.createdAt || post.updatedAt || index}`
  );
}

function getPostTitle(post: Post): string {
  return post.titulo || post.title || "";
}

function getPostContent(post: Post): string {
  return post.contenido || post.content || "";
}

function getPostUser(post: Post): Usuario | undefined {
  return post.usuario || post.author;
}

function getLikeCount(post: Post): number {
  return post.reacciones?.meGusta?.count ?? post.reactions?.like?.count ?? 0;
}

function getFeedMood(index: number): string {
  const moods = ["🔥 Encendido", "🍻 Muy guardado", "📍 Para salir hoy", "✨ Te va a gustar"];
  return moods[index % moods.length];
}

function mapPostsToFeed(posts: Post[]): FeedSeed[] {
  return posts
    .map((post, index) => {
      const title = getPostTitle(post) || "Hallazgo de la comunidad";
      const body =
        getPostContent(post) || "Una recomendación cervecera que merece un segundo vistazo.";
      const author = getPostUser(post)?.username || "Cervecero";
      const mediaList = getPostMediaList(post)
        .map((m) => ({ url: getImageUrl(m.path), type: m.type ?? null }))
        .filter((m) => !!m.url);
      const primary = mediaList[0] ?? null;
      const id = getPostId(post) || `post-${index}`;

      return {
        id,
        title,
        body,
        image: primary?.url ?? "",
        mediaType: primary?.type ?? null,
        mediaList,
        author,
        likes: getLikeCount(post),
        likedByUsers: post.reacciones?.meGusta?.usuarios || post.reactions?.like?.users || [],
        createdAt: post.createdAt || post.updatedAt || new Date().toISOString(),
        route: getPostId(post) ? `/posts/${getPostId(post)}` : "/posts",
        kicker:
          primary?.type === "video"
            ? "Historia en video"
            : mediaList.length > 1
              ? `${mediaList.length} fotos`
              : primary
                ? "Historia visual"
                : "Dato para guardar",
        mood: getFeedMood(index),
      };
    })
    .filter((item) => item.title || item.body);
}

function mergePosts(current: Post[], incoming: Post[]): Post[] {
  const merged = new Map<string, Post>();

  current.forEach((post, index) => {
    merged.set(getPostKey(post, index), post);
  });

  incoming.forEach((post, index) => {
    const key = getPostKey(post, current.length + index);
    const previous = merged.get(key);
    merged.set(key, previous ? { ...previous, ...post } : post);
  });

  return Array.from(merged.values());
}

function buildSeedComments(item: FeedSeed, index: number): FeedComment[] {
  const commentSets = [
    [
      {
        author: "malta.norte",
        text: "Este tipo de historia es la que me hace guardar el plan al tiro. ¿Dónde partirías?",
        replies: [
          {
            author: "lupulo.club",
            text: "Si hay hazy en la carta, yo parto por ahí sin pensarlo.",
          },
        ],
      },
      {
        author: "barra.artesanal",
        text: "La portada vende sola, pero el copy termina de empujarte.",
        replies: [
          { author: "cerveza.y.ruta", text: "Sí, da ganas de mandarla al grupo y salir hoy." },
        ],
      },
    ],
    [
      {
        author: "ipa.de.guardia",
        text: "Necesito más cápsulas así: una idea clara y cero humo.",
        replies: [
          { author: "hops.and.friends", text: "Exacto. Ver, comentar, guardar y seguir bajando." },
        ],
      },
      {
        author: "luna.stout",
        text: "Esto pide botón de compartir directo al chat de amigos.",
        replies: [{ author: "taproom.radar", text: "Y responder comentarios sin salir del muro." }],
      },
    ],
  ];

  return commentSets[index % commentSets.length].map((comment, commentIndex) => ({
    id: `${item.id}-seed-${commentIndex}`,
    author: comment.author,
    text: comment.text,
    replies: comment.replies.map((reply, replyIndex) => ({
      id: `${item.id}-seed-${commentIndex}-reply-${replyIndex}`,
      author: reply.author,
      text: reply.text,
    })),
    source: "seed",
  }));
}

function MediaSlideshow({
  items,
  headline,
}: {
  items: Array<{ url: string; type: "image" | "video" | null }>;
  headline: string;
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [failedIdx, setFailedIdx] = useState<Set<number>>(new Set());

  const goTo = (next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  };

  const item = items[current];
  const failed = failedIdx.has(current);
  const markFailed = () => setFailedIdx((prev) => new Set([...prev, current]));

  const variants = {
    enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
    center: { x: "0%" },
    exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
  };

  return (
    <div className="relative w-full" style={{ background: "#0a0608" }}>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="w-full"
        >
          {item.type === "video" && !failed ? (
            <video
              src={item.url}
              className="relative z-10 h-auto max-h-[42vh] w-full bg-black object-contain sm:max-h-[520px]"
              playsInline
              preload="metadata"
              controls
              onError={markFailed}
            />
          ) : !failed ? (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${item.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(40px) saturate(140%) brightness(0.6)",
                  transform: "scale(1.2)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,6,8,0.15) 0%, rgba(10,6,8,0.35) 100%)",
                }}
              />
              <div className="relative z-10 mx-auto flex w-full items-center justify-center">
                <Image
                  src={item.url}
                  alt={headline}
                  width={1200}
                  height={1500}
                  unoptimized
                  className="h-auto max-h-[42vh] w-auto max-w-full object-contain sm:max-h-[520px]"
                  onError={markFailed}
                />
              </div>
            </>
          ) : (
            <div
              className="relative z-10 flex aspect-[4/5] flex-col items-center justify-center gap-3 px-6 text-center sm:aspect-[16/9]"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-surface-card-alt) 86%, transparent), color-mix(in srgb, var(--color-surface-card) 94%, transparent))",
                color: "var(--color-text-secondary)",
              }}
            >
              <span className="text-3xl">🖼️</span>
              <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                No pudimos cargar esta imagen
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev arrow */}
      {current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-3 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
      )}

      {/* Next arrow */}
      {current < items.length - 1 && (
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-3 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          aria-label="Imagen siguiente"
        >
          ›
        </button>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            style={{
              width: i === current ? 16 : 6,
              height: 6,
              borderRadius: 999,
              background: i === current ? "#fff" : "rgba(255,255,255,0.42)",
              transition: "all 0.22s ease",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({
  item,
  index,
}: {
  item: FeedSeed & { renderId: string; lap: number };
  index: number;
}) {
  const { user } = useAuth();
  const hasMedia = Boolean(item.image);
  const hasRealPost = item.route.startsWith("/posts/") && !item.id.startsWith("fallback");
  const currentUserId = user?._id || (user as { id?: string } | null)?.id || "";
  const headline = item.title.trim() || item.body.trim() || "Historia cervecera";
  const supportingText = item.body.trim() && item.body.trim() !== headline ? item.body.trim() : "";
  const authorInitial = item.author.trim().charAt(0).toUpperCase() || "L";
  const [mediaFailed, setMediaFailed] = useState(false);
  const [liked, setLiked] = useState(() =>
    currentUserId ? item.likedByUsers.includes(currentUserId) : false,
  );
  const [likedCount, setLikedCount] = useState(item.likes);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>(() =>
    hasRealPost ? [] : buildSeedComments(item, index),
  );
  const currentUsername = getDisplayName(normalizeStoredAuthUser(user));
  const commentCount =
    comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0);

  useEffect(() => {
    if (!commentsOpen || !hasRealPost || commentsLoaded) return;

    let active = true;

    const loadComments = async () => {
      try {
        const res = await api.get(`/post/${item.id}/comentarios`);
        const data = extractListFromPayload<FeedCommentApi>(res.data, ["comments", "comentarios"]);

        if (!active) return;

        const mapped = data
          .map((comment: FeedCommentApi, commentIndex: number) => ({
            id: comment.id || comment._id || `${item.id}-server-${commentIndex}`,
            author: comment.usuario?.username || comment.author?.username || "cervecero",
            text: comment.comentario || comment.content || "",
            replies: [] as FeedReply[],
            source: "server" as const,
          }))
          .filter((comment: FeedComment) => comment.text.trim().length > 0);

        setComments(mapped);
      } catch (error) {
        console.error("❌ Error al cargar comentarios desde el muro:", error);
      } finally {
        if (active) {
          setCommentsLoaded(true);
        }
      }
    };

    loadComments();

    return () => {
      active = false;
    };
  }, [commentsLoaded, commentsOpen, hasRealPost, item.id]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = window.setTimeout(() => setFeedbackMessage(""), 2400);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const handleShareNative = async () => {
    const url = `${window.location.origin}${item.route}`;
    const text = `${headline}${supportingText ? ` — ${supportingText}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: headline, text, url });
        setFeedbackMessage("Publicación compartida desde tu dispositivo.");
        return;
      } catch {
        /* no-op */
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setFeedbackMessage("Enlace copiado para abrirlo desde Instagram o Threads.");
    } catch {
      setFeedbackMessage("No pude copiar el enlace esta vez.");
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(`${window.location.origin}${item.route}`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}${item.route}`;
    const text = encodeURIComponent(
      `${headline}${supportingText ? ` — ${supportingText}` : ""} ${url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.route}`);
      setFeedbackMessage("Enlace copiado. Ya lo puedes mandar donde quieras.");
    } catch {
      setFeedbackMessage("No pude copiar el enlace.");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentDraft.trim()) return;

    const optimisticComment: FeedComment = {
      id: `${item.id}-local-${Date.now()}`,
      author: currentUsername,
      text: commentDraft.trim(),
      replies: [],
      source: "local",
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setCommentDraft("");

    if (!hasRealPost) return;

    try {
      setIsSubmittingComment(true);
      await api.post(`/post/${item.id}/comentario`, { content: optimisticComment.text });
    } catch (error) {
      console.error("❌ Error al publicar comentario desde el home:", error);
      setFeedbackMessage("Tu comentario quedó local por ahora. Revísalo luego en el post.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikedCount((count) => count + (wasLiked ? -1 : 1));

    if (!hasRealPost || !currentUserId) return;

    try {
      await api.post(`/post/${item.id}/react`, { type: "meGusta" });
    } catch (error) {
      console.error("❌ Error al reaccionar al post:", error);
      setLiked(wasLiked);
      setLikedCount((count) => count + (wasLiked ? 1 : -1));
      setFeedbackMessage("No pudimos registrar tu voto esta vez.");
    }
  };

  const toggleSharePanel = () => {
    setShareOpen((value) => {
      const next = !value;
      if (next) setCommentsOpen(false);
      return next;
    });
  };

  const toggleCommentsPanel = () => {
    setCommentsOpen((value) => {
      const next = !value;
      if (next) setShareOpen(false);
      return next;
    });
  };

  return (
    <motion.article
      key={item.renderId}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="snap-start"
    >
      <div
        className="home-feed-card relative mx-auto w-full overflow-hidden rounded-[1.8rem] border"
        style={{
          maxWidth: HOME_FEED_MAX_WIDTH,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
          borderColor: "color-mix(in srgb, var(--color-border-light) 74%, transparent)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-[12%] top-0 h-28 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-amber-primary) 18%, transparent) 0%, transparent 72%)",
            filter: "blur(38px)",
            opacity: 0.72,
          }}
        />

        {item.mediaList.length > 1 ? (
          <div
            className="relative overflow-hidden border-b"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
            }}
          >
            <MediaSlideshow items={item.mediaList} headline={headline} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between p-4">
              <span
                className="rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.18em] uppercase"
                style={{
                  borderColor: "rgba(255,255,255,0.5)",
                  background: "rgba(8,5,3,0.78)",
                  color: "#fff",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {item.kicker}
              </span>
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  background: "rgba(8,5,3,0.78)",
                  color: "#fff",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>
        ) : hasMedia ? (
          <div
            className="relative overflow-hidden border-b"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
              background: "#0a0608",
            }}
          >
            {!mediaFailed && item.mediaType === "video" ? (
              <video
                src={item.image}
                className="relative z-10 h-auto max-h-[42vh] w-full bg-black object-contain sm:max-h-[520px]"
                playsInline
                preload="metadata"
                controls
                onError={() => setMediaFailed(true)}
              />
            ) : !mediaFailed ? (
              <>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(40px) saturate(140%) brightness(0.6)",
                    transform: "scale(1.2)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,6,8,0.15) 0%, rgba(10,6,8,0.35) 100%)",
                  }}
                />
                <div className="relative z-10 mx-auto flex w-full items-center justify-center">
                  <Image
                    src={item.image}
                    alt={headline}
                    width={1200}
                    height={1500}
                    unoptimized
                    className="h-auto max-h-[42vh] w-auto max-w-full object-contain sm:max-h-[520px]"
                    onError={() => setMediaFailed(true)}
                  />
                </div>
              </>
            ) : (
              <div
                className="relative z-10 flex aspect-[4/5] flex-col items-center justify-center gap-3 px-6 text-center sm:aspect-[16/9]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--color-surface-card-alt) 86%, transparent), color-mix(in srgb, var(--color-surface-card) 94%, transparent))",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span className="text-3xl">🖼️</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    No pudimos cargar esta imagen
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed">
                    La publicación sí existe, pero la URL del archivo no respondió como esperábamos.
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
              <span
                className="rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.18em] uppercase"
                style={{
                  borderColor: "rgba(255,255,255,0.5)",
                  background: "rgba(8,5,3,0.78)",
                  color: "#fff",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {item.mediaType === "video" ? "Video" : "Publicación"}
              </span>
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  background: "rgba(8,5,3,0.78)",
                  color: "#fff",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="home-feed-card-body relative p-3 sm:p-[1.125rem]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.78rem] font-black sm:h-9 sm:w-9"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                {authorInitial}
              </div>
              <p
                className="truncate text-[0.88rem] font-bold sm:text-[0.92rem]"
                style={{ color: "var(--color-text-primary)" }}
              >
                @{item.author}
              </p>
            </div>

            <Link
              href={item.route}
              className="shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase transition-all"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--color-text-secondary)",
              }}
            >
              Abrir
            </Link>
          </div>

          {supportingText ? (
            <p
              className="mt-2.5 line-clamp-2 text-[0.88rem] leading-snug sm:mt-4 sm:text-[0.95rem] sm:leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              {supportingText}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={liked}
              className="group flex h-11 items-center justify-center gap-1.5 rounded-[1rem] border px-2 transition-all active:scale-[0.97] sm:h-12 sm:gap-2 sm:px-4"
              style={{
                borderColor: liked
                  ? "color-mix(in srgb, var(--color-amber-primary) 55%, var(--color-border-light))"
                  : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                background: liked
                  ? "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)"
                  : "rgba(255,255,255,0.03)",
                color: liked ? "var(--color-amber-primary)" : "var(--color-text-primary)",
              }}
            >
              <svg
                className="h-[18px] w-[18px] transition-transform group-active:scale-125"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-[13px] font-bold tabular-nums">{likedCount}</span>
            </button>

            <button
              type="button"
              onClick={toggleCommentsPanel}
              aria-pressed={commentsOpen}
              className="group flex h-11 items-center justify-center gap-1.5 rounded-[1rem] border px-2 transition-all active:scale-[0.97] sm:h-12 sm:gap-2 sm:px-4"
              style={{
                borderColor: commentsOpen
                  ? "color-mix(in srgb, var(--color-amber-primary) 55%, var(--color-border-light))"
                  : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                background: commentsOpen
                  ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                  : "rgba(255,255,255,0.03)",
                color: commentsOpen ? "var(--color-amber-primary)" : "var(--color-text-primary)",
              }}
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-[13px] font-bold tabular-nums">{commentCount}</span>
            </button>

            <button
              type="button"
              onClick={toggleSharePanel}
              aria-pressed={shareOpen}
              className="group flex h-11 items-center justify-center gap-1.5 rounded-[1rem] border px-2 transition-all active:scale-[0.97] sm:h-12 sm:gap-2 sm:px-4"
              style={{
                borderColor: shareOpen
                  ? "color-mix(in srgb, var(--color-amber-primary) 55%, var(--color-border-light))"
                  : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                background: shareOpen
                  ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                  : "rgba(255,255,255,0.03)",
                color: shareOpen ? "var(--color-amber-primary)" : "var(--color-text-primary)",
              }}
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="hidden text-[13px] font-bold sm:inline">Compartir</span>
            </button>
          </div>

          {feedbackMessage ? (
            <p
              className="mt-4 text-[12px] font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {feedbackMessage}
            </p>
          ) : null}

          <AnimatePresence initial={false}>
            {shareOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-5 rounded-[1.35rem] border p-4"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent), color-mix(in srgb, var(--color-surface-card) 92%, transparent))",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-[11px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Compartir publicación
                    </p>
                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Mándala a Meta o copia el enlace al estilo TikTok / Instagram.
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 rounded-[1rem] border px-3 py-2.5 text-[12px] font-medium"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {typeof window !== "undefined"
                    ? `${window.location.origin}${item.route}`
                    : item.route}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Facebook", action: handleShareFacebook },
                    { label: "WhatsApp", action: handleShareWhatsApp },
                    { label: "Instagram / Threads", action: handleShareNative },
                    { label: "Copiar enlace", action: handleCopyLink },
                  ].map((shareAction) => (
                    <button
                      key={shareAction.label}
                      type="button"
                      onClick={shareAction.action}
                      className="rounded-[1rem] border px-4 py-3 text-left text-sm font-bold transition-all"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {shareAction.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {commentsOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-5 rounded-[1.35rem] border p-4"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent), color-mix(in srgb, var(--color-surface-card) 92%, transparent))",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-[11px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Comentarios
                    </p>
                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Abre y cierra esta sección sin salir del home.
                    </p>
                  </div>
                  <Link
                    href={item.route}
                    className="shrink-0 text-[12px] font-semibold"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Abrir post completo
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {hasRealPost && !commentsLoaded ? (
                    <div
                      className="rounded-[1rem] border px-4 py-4 text-sm font-medium"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Cargando comentarios...
                    </div>
                  ) : comments.length === 0 ? (
                    <div
                      className="rounded-[1rem] border px-4 py-4 text-sm font-medium"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Aún no hay comentarios. Sé el primero en abrir la conversación.
                    </div>
                  ) : (
                    comments.slice(0, 4).map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-[1rem] border px-4 py-3.5"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <p
                          className="text-sm font-bold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          @{comment.author}
                        </p>
                        <p
                          className="mt-1 text-[14px] leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {comment.text}
                        </p>

                        {comment.replies.length > 0 ? (
                          <div
                            className="mt-3 space-y-2 border-l pl-3"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                            }}
                          >
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <p
                                  className="text-[12px] font-bold"
                                  style={{ color: "var(--color-text-primary)" }}
                                >
                                  @{reply.author}
                                </p>
                                <p
                                  className="text-[12px] leading-relaxed"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="min-w-0 flex-1 rounded-full border px-4 py-3 text-[13px] outline-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={isSubmittingComment}
                    className="rounded-full px-5 py-3 text-[12px] font-bold disabled:opacity-60"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                      boxShadow: "var(--shadow-amber-glow)",
                    }}
                  >
                    {isSubmittingComment ? "Publicando..." : "Comentar"}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function SidebarWidgetRail({
  label,
  actions,
  children,
}: {
  label?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex max-h-[calc(100vh-7rem)] flex-col gap-2.5 overflow-x-hidden overflow-y-auto pr-1"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(251,191,36,0.18) transparent",
      }}
    >
      <div className={`flex items-center px-1.5 ${label ? "justify-between" : "justify-end"}`}>
        {label ? (
          <span
            className="text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {label}
          </span>
        ) : null}
        {actions ? <div className="flex items-center gap-1.5">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function SidebarWidget({
  eyebrow,
  title,
  actionLabel,
  actionHref,
  headerActions,
  collapsed,
  collapsedNote,
  children,
}: {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  headerActions?: React.ReactNode;
  collapsed?: boolean;
  collapsedNote?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="group/widget-home relative overflow-hidden rounded-[1.5rem] p-4"
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
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border:
            "1px solid color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-5 bottom-[1px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-light) 40%, transparent), transparent)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-amber-primary)" }}
            >
              {eyebrow}
            </p>
            <h3
              className="mt-1 text-[1.05rem] leading-snug font-black"
              style={{ color: "var(--color-text-primary)" }}
            >
              {title}
            </h3>
          </div>

          {actionLabel || headerActions ? (
            <div className="flex shrink-0 items-center gap-1.5">
              {actionLabel && actionHref ? (
                <Link
                  href={actionHref}
                  className="shrink-0 text-[11px] font-semibold transition-colors hover:opacity-100"
                  style={{ color: "var(--color-text-secondary)", opacity: 0.9 }}
                >
                  {actionLabel}
                </Link>
              ) : null}
              {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
            </div>
          ) : null}
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {collapsed ? (
            collapsedNote ? (
              <motion.p
                key="collapsed-note"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 text-[11px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {collapsedNote}
              </motion.p>
            ) : null
          ) : (
            <motion.div
              key="widget-content"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function SidebarWidgetChromeButton({
  label,
  title,
  active = false,
  onClick,
  onPointerDown,
  className,
  children,
}: {
  label: string;
  title: string;
  active?: boolean;
  onClick?: () => void;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-all ${className ?? ""}`}
      style={{
        borderColor: active
          ? "color-mix(in srgb, var(--color-amber-primary) 44%, var(--color-border-light))"
          : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
        background: active
          ? "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)"
          : "rgba(255,255,255,0.04)",
        color: active ? "var(--color-amber-primary)" : "var(--color-text-muted)",
      }}
      aria-label={label}
      title={title}
    >
      {children}
    </motion.button>
  );
}

function SidebarWidgetMetric({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
      style={{
        borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
        background: "rgba(255,255,255,0.03)",
        color: "var(--color-text-muted)",
      }}
    >
      <span style={{ color: "var(--color-text-primary)" }}>{value}</span> {label}
    </div>
  );
}

function SidebarWidgetList({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-2.5 pb-1"
      style={{
        minHeight: "fit-content",
      }}
    >
      {children}
    </div>
  );
}

function SidebarWidgetItem({
  href,
  icon,
  title,
  description,
  badge,
  ctaLabel = "Abrir",
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group/item block rounded-[1.2rem] border px-3.5 py-3 transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] text-base"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 90%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 84%, transparent))",
            border: "1px solid color-mix(in srgb, var(--color-border-light) 64%, transparent)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </p>
            {badge ? (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] uppercase"
                style={{
                  background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                  color: "var(--color-amber-primary)",
                }}
              >
                {badge}
              </span>
            ) : null}
          </div>

          <p
            className="mt-1 text-[12px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span
              className="text-[11px] font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {ctaLabel}
            </span>
            <span
              className="text-[11px] transition-transform duration-200 group-hover/item:translate-x-0.5"
              style={{ color: "var(--color-amber-primary)" }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function WidgetPickerCard({
  options,
  onAdd,
}: {
  options: ReadonlyArray<{
    id: HomeWidgetId;
    label: string;
    description: string;
  }>;
  onAdd: (id: HomeWidgetId) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      className="overflow-hidden rounded-[1.45rem] border p-3"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
        boxShadow:
          "0 18px 46px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-amber-primary)" }}
          >
            Agregar widgets
          </p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
            Elige los paneles que quieres ver en tu home.
          </p>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--color-text-muted)",
          }}
        >
          {options.length} disponibles
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        Agrégalos y luego ordénalos o minimízalos desde el rail.
      </p>

      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <motion.button
            type="button"
            key={option.id}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAdd(option.id)}
            className="flex w-full items-center gap-3 rounded-[1.1rem] border px-3 py-2.5 text-left transition-all"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                {option.label}
              </p>
              <p
                className="mt-0.5 text-[11px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {option.description}
              </p>
            </div>
            <span
              className="flex h-8 min-w-[80px] shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-bold tracking-[0.16em] uppercase"
              style={{
                background: "var(--gradient-button-primary)",
                color: "var(--color-text-dark)",
                boxShadow: "var(--shadow-amber-glow)",
              }}
            >
              Agregar
            </span>
          </motion.button>
        ))}

        {options.length === 0 ? (
          <div
            className="rounded-[1.15rem] border px-3 py-4 text-center"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p className="text-[12px] font-medium" style={{ color: "var(--color-text-muted)" }}>
              Todos tus widgets Tahoe ya están activos.
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function HomeWidgetCard({
  id,
  label,
  collapsed,
  onClose,
  onToggleCollapse,
  children,
}: {
  id: HomeWidgetId;
  label: string;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  children: (options: { headerActions: React.ReactNode; collapsed: boolean }) => React.ReactNode;
}) {
  const dragControls = useDragControls();

  const headerActions = (
    <div className="flex items-center gap-1">
      <SidebarWidgetChromeButton
        label={`Reordenar widget ${label}`}
        title={`Mover ${label}`}
        onPointerDown={(event) => dragControls.start(event)}
        className="cursor-grab active:cursor-grabbing"
      >
        ≡
      </SidebarWidgetChromeButton>
      <SidebarWidgetChromeButton
        label={collapsed ? `Expandir widget ${label}` : `Minimizar widget ${label}`}
        title={collapsed ? `Expandir ${label}` : `Minimizar ${label}`}
        onClick={onToggleCollapse}
        active={collapsed}
      >
        {collapsed ? "+" : "−"}
      </SidebarWidgetChromeButton>
      <SidebarWidgetChromeButton
        label={`Cerrar widget ${label}`}
        title={`Cerrar ${label}`}
        onClick={onClose}
      >
        ×
      </SidebarWidgetChromeButton>
    </div>
  );

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="list-none"
    >
      {children({ headerActions, collapsed })}
    </Reorder.Item>
  );
}

/* ═══════════════════════════════════════════════
   Right Widget Panel — Tahoe liquid-glass cards
   ═══════════════════════════════════════════════ */

function RightWidgetCard({
  label,
  collapsed,
  onClose,
  onToggleCollapse,
  children,
}: {
  label: string;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 18, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden rounded-[1.5rem] border"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 95%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 color-mix(in srgb, var(--color-amber-primary) 5%, transparent)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-amber-primary)" }}
          >
            {label}
          </p>
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleCollapse}
              className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-all"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                background: collapsed
                  ? "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)"
                  : "rgba(255,255,255,0.04)",
                color: collapsed ? "var(--color-amber-primary)" : "var(--color-text-muted)",
              }}
              aria-label={collapsed ? "Expandir" : "Minimizar"}
            >
              {collapsed ? "+" : "−"}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-full border text-[13px] transition-all"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--color-text-muted)",
              }}
              aria-label="Cerrar widget"
            >
              ×
            </motion.button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="rw-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RightWidgetPicker({
  options,
  onAdd,
  onClose,
}: {
  options: ReadonlyArray<{ id: RightWidgetId; label: string; description: string }>;
  onAdd: (id: RightWidgetId) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className="overflow-hidden rounded-[1.4rem] border p-3"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, var(--color-border-light))",
        boxShadow:
          "0 16px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.14)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-amber-primary)" }}
        >
          Agregar widget
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full border text-[13px]"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--color-text-muted)",
          }}
        >
          ×
        </motion.button>
      </div>

      {options.length === 0 ? (
        <p
          className="mt-3 text-[11px] font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          Todos los widgets ya están activos.
        </p>
      ) : (
        <div className="mt-2.5 space-y-1.5">
          {options.map((opt) => (
            <motion.button
              key={opt.id}
              type="button"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { onAdd(opt.id); onClose(); }}
              className="flex w-full items-center gap-2.5 rounded-[1.1rem] border px-3 py-2.5 text-left"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {opt.label}
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {opt.description}
                </p>
              </div>
              <span
                className="flex h-6 shrink-0 items-center rounded-full px-2.5 text-[9px] font-bold tracking-[0.14em] uppercase"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                }}
              >
                Agregar
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Magic Composer — Liquid-glass post creator
   ═══════════════════════════════════════════════ */

const PLACEHOLDER_LINES = [
  "¿Qué estás tomando...?",
  "Comparte tu último descubrimiento 🍺",
  "¿Probaste algo nuevo hoy?",
  "Cuenta tu historia cervecera...",
  "¿Cuál fue la chela del fin de semana?",
];

function getMediaFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatMediaSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function formatMediaDuration(totalSeconds?: number | null) {
  if (!totalSeconds || totalSeconds <= 0) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function MagicComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const [focused, setFocused] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaDurations, setMediaDurations] = useState<Record<string, number>>({});
  const [composerError, setComposerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Neon border rotation
  const rotation = useMotionValue(0);
  useEffect(() => {
    const ctrl = fmAnimate(rotation, 360, { duration: 7, repeat: Infinity, ease: "linear" });
    return () => ctrl.stop();
  }, [rotation]);

  // Aurora palette: violet → rose → fuchsia → indigo → violet
  const neonBg = useTransform(
    rotation,
    (r) =>
      `conic-gradient(from ${r}deg,` +
      `#7c3aed 0%,` +
      `#a855f7 15%,` +
      `#ec4899 35%,` +
      `#f43f5e 50%,` +
      `#d946ef 65%,` +
      `#818cf8 82%,` +
      `#7c3aed 100%)`,
  );

  // Rotate placeholder
  useEffect(() => {
    if (focused) return;
    const timer = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_LINES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [focused]);

  // Manage file previews
  useEffect(() => {
    const urls = mediaFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [mediaFiles]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setComposerError("");
    const acceptedFiles: File[] = [];
    const nextDurations: Record<string, number> = {};

    for (const file of files) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setComposerError("Solo puedes subir imagenes o videos en este espacio.");
        continue;
      }

      if (file.type.startsWith("video/")) {
        try {
          const durationSeconds = await readVideoDurationSeconds(file);
          if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
            setComposerError("Los videos del muro pueden durar hasta 12 minutos.");
            continue;
          }
          nextDurations[getMediaFileKey(file)] = durationSeconds;
        } catch (error) {
          console.error("❌ Error al leer duración del video:", error);
          setComposerError("No pudimos leer uno de los videos seleccionados.");
          continue;
        }
      }

      acceptedFiles.push(file);
    }

    const availableSlots = Math.max(0, 4 - mediaFiles.length);
    const filesToAdd = acceptedFiles.slice(0, availableSlots);
    if (acceptedFiles.length > availableSlots) {
      setComposerError("Puedes subir hasta 4 archivos por historia.");
    }

    if (filesToAdd.length > 0) {
      setMediaFiles((prev) => [...prev, ...filesToAdd]);
      setMediaDurations((prev) => {
        const merged = { ...prev };
        for (const file of filesToAdd) {
          const cachedDuration = nextDurations[getMediaFileKey(file)];
          if (typeof cachedDuration === "number") {
            merged[getMediaFileKey(file)] = cachedDuration;
          }
        }
        return merged;
      });
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove) {
        const key = getMediaFileKey(fileToRemove);
        setMediaDurations((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!contenido.trim() && mediaFiles.length === 0) return;
    setIsSubmitting(true);
    setComposerError("");

    try {
      let uploadedMediaItems: PostMedia[] = [];
      let uploadedPaths: string[] = [];

      if (mediaFiles.length > 0) {
        const formData = new FormData();
        for (const file of mediaFiles) {
          formData.append("media", file);
        }

        const res = await api.post(`/post/muro-vikingo/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedMediaItems = extractUploadedMediaList(res.data);
        uploadedPaths = uploadedMediaItems.map((m) => m.path);

        if (uploadedMediaItems.length === 0) {
          throw new Error("Upload response did not include any media paths");
        }
      }

      await api.post(`/post/muro-vikingo`, {
        ...(titulo.trim() ? { title: titulo.trim() } : {}),
        ...(contenido.trim() ? { content: contenido.trim() } : {}),
        ...(uploadedMediaItems.length > 0
          ? {
              media: uploadedMediaItems,
              images: uploadedPaths,
            }
          : {}),
      });

      setTitulo("");
      setContenido("");
      setMediaFiles([]);
      setMediaDurations({});
      setFocused(false);
      onPostCreated();
    } catch (err) {
      console.error("❌ Error al publicar:", err);
      setComposerError("No pudimos publicar tu historia. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContent = titulo.trim() || contenido.trim() || mediaFiles.length > 0;
  const displayName = getDisplayName(normalizeStoredAuthUser(user));

  return (
    <div
      className="home-composer-shell relative mx-auto mb-5 w-full"
      style={{ maxWidth: HOME_FEED_MAX_WIDTH, borderRadius: 24, padding: 2 }}
    >
      {/* ── Aurora glow — soft outer halo ── */}
      <motion.div
        className="absolute -inset-[10px]"
        style={{
          borderRadius: 34,
          background: neonBg,
          filter: "blur(22px)",
          opacity: focused ? 0.6 : 0.22,
          transition: "opacity 0.5s ease",
        }}
      />
      {/* ── Neon border — crisp rotating line ── */}
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: 24,
          background: neonBg,
          opacity: focused ? 1 : 0.6,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* ── Card body — liquid glass ── */}
      <div
        className="home-composer-body relative overflow-hidden"
        style={{
          borderRadius: 22,
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-surface-card) 92%, transparent) 0%, color-mix(in srgb, var(--color-surface-card-alt) 86%, transparent) 100%)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          boxShadow: focused
            ? "0 0 60px rgba(168,85,247,0.12), 0 0 30px rgba(236,72,153,0.10), inset 0 1px 0 rgba(255,255,255,0.14)"
            : "0 0 24px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.09)",
          transition: "box-shadow 0.5s ease",
        }}
      >
        {/* Subtle inner glass reflection */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        <div className="home-composer-content px-4 py-3.5">
          {/* ── Top row: avatar + placeholder/textarea ── */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.82rem] font-black"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* Input area */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                {!focused ? (
                  <motion.button
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setFocused(true);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className="home-composer-placeholder w-full cursor-text rounded-2xl px-3.5 py-2.5 text-left text-[0.95rem] transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <motion.span
                      key={placeholderIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="block"
                    >
                      {PLACEHOLDER_LINES[placeholderIdx]}
                    </motion.span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <textarea
                      ref={textareaRef}
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      onFocus={() => setFocused(true)}
                      placeholder="¿Qué estás tomando...?"
                      rows={3}
                      className="w-full resize-none border-0 bg-transparent text-[0.95rem] leading-relaxed shadow-none outline-none placeholder:text-white/25 focus:outline-none"
                      style={{
                        color: "var(--color-text-primary)",
                        border: "none",
                        boxShadow: "none",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Media previews ── */}
          <AnimatePresence>
            {mediaPreviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden rounded-[1.45rem] border p-3"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 30px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.22em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Preview premium
                    </p>
                    <p
                      className="mt-1 text-[12px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {mediaFiles.length} de 4 archivos listos para publicar
                    </p>
                  </div>
                  <div
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                    style={{
                      borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                      color: "var(--color-text-muted)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    Videos hasta {Math.floor(MAX_VIDEO_DURATION_SECONDS / 60)} min
                  </div>
                </div>

                <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
                  {mediaPreviews.map((src, i) => {
                    const file = mediaFiles[i];
                    const isVideo = !!file?.type.startsWith("video/");
                    const fileKey = file ? getMediaFileKey(file) : src;
                    const durationLabel = file
                      ? formatMediaDuration(mediaDurations[fileKey] ?? null)
                      : null;

                    return (
                      <motion.div
                        key={src}
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        className="group relative min-w-[220px] snap-start overflow-hidden rounded-[1.25rem] border"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                        }}
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          {isVideo ? (
                            <video
                              src={src}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <Image src={src} alt="" fill unoptimized className="object-cover" />
                          )}

                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(11,8,18,0.04) 0%, rgba(11,8,18,0.18) 58%, rgba(11,8,18,0.62) 100%)",
                            }}
                          />

                          <div className="absolute top-2.5 left-2.5 flex gap-2">
                            <span
                              className="rounded-full border px-2 py-1 text-[10px] font-bold tracking-[0.16em] uppercase"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
                                background: "rgba(12, 10, 18, 0.52)",
                                color: "#fff",
                                backdropFilter: "blur(12px)",
                              }}
                            >
                              {isVideo ? "Video" : "Imagen"}
                            </span>

                            {durationLabel ? (
                              <span
                                className="rounded-full border px-2 py-1 text-[10px] font-semibold"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
                                  background: "rgba(12, 10, 18, 0.44)",
                                  color: "rgba(255,255,255,0.92)",
                                  backdropFilter: "blur(12px)",
                                }}
                              >
                                {durationLabel}
                              </span>
                            ) : null}
                          </div>

                          <button
                            onClick={() => removeFile(i)}
                            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border text-xs text-white opacity-0 transition-all duration-200 group-hover:opacity-100"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--color-border-light) 64%, transparent)",
                              background: "rgba(12, 10, 18, 0.52)",
                              backdropFilter: "blur(12px)",
                            }}
                            aria-label={`Quitar ${file?.name || "archivo"}`}
                          >
                            ✕
                          </button>

                          <div className="absolute right-3 bottom-3 left-3">
                            <p
                              className="truncate text-sm font-bold"
                              style={{ color: "#fff" }}
                              title={file?.name}
                            >
                              {file?.name || "Archivo multimedia"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px]">
                              <span style={{ color: "rgba(255,255,255,0.82)" }}>
                                {file ? formatMediaSize(file.size) : ""}
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
                              <span style={{ color: "rgba(255,255,255,0.68)" }}>
                                {i + 1}/{mediaFiles.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {composerError ? (
            <p className="mt-3 text-sm font-medium text-amber-300/95">{composerError}</p>
          ) : null}

          {/* ── Action bar ── */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {/* Photo */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(251,191,36,0.08)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>📷</span> Foto
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(251,191,36,0.08)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>🎬</span> Video
                  </motion.button>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFocused(false);
                      setTitulo("");
                      setContenido("");
                      setMediaFiles([]);
                      setMediaDurations({});
                    }}
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSubmit}
                    disabled={!hasContent || isSubmitting}
                    className="relative overflow-hidden rounded-full px-5 py-1.5 text-[12px] font-bold transition-all disabled:opacity-40"
                    style={{
                      background: hasContent
                        ? "var(--gradient-button-primary)"
                        : "rgba(255,255,255,0.06)",
                      color: hasContent ? "var(--color-text-dark)" : "var(--color-text-muted)",
                      boxShadow: hasContent ? "var(--shadow-amber-glow)" : "none",
                    }}
                  >
                    {isSubmitting ? "Publicando..." : "Publicar 🍻"}
                    {hasContent && (
                      <span
                        className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-700 hover:translate-x-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        }}
                      />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoggedInHome() {
  const { user, setUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>(DEFAULT_PROFILE_STATS);
  const [trendingBeers, setTrendingBeers] = useState<HomeBeer[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<HomePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [feedTotal, setFeedTotal] = useState<number | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [enabledWidgets, setEnabledWidgets] = useState<HomeWidgetId[]>(DEFAULT_HOME_WIDGETS);
  const [collapsedWidgets, setCollapsedWidgets] = useState<HomeWidgetId[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rightWidgets, setRightWidgets] = useState<RightWidgetId[]>(DEFAULT_RIGHT_WIDGETS);
  const [collapsedRightWidgets, setCollapsedRightWidgets] = useState<RightWidgetId[]>([]);
  const [rightPickerOpen, setRightPickerOpen] = useState(false);
  const extendLockRef = useRef(0);
  const feedRequestInFlightRef = useRef(false);
  const widgetPrefsHydratedRef = useRef(false);
  const rightWidgetPrefsHydratedRef = useRef(false);
  const currentUserId = user?._id || (typeof user?.id === "string" ? user.id : "") || "";
  const currentUserAvatar = user?.fotoPerfil || user?.photo || user?.profilePicture || "";

  const fetchPosts = async (page = 1, mode: "replace" | "append" = "replace") => {
    if (feedRequestInFlightRef.current) return;

    feedRequestInFlightRef.current = true;
    if (mode === "replace") {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await api.get("/post/muro-vikingo", {
        params: {
          page,
          limit: FEED_PAGE_SIZE,
        },
      });
      const data = extractListFromPayload<Post>(res.data, ["posts"]);
      const total = extractTotalFromPayload(res.data);

      setFeedPage(page);
      setFeedTotal(total);
      setHasMorePosts(
        total !== null ? page * FEED_PAGE_SIZE < total : data.length === FEED_PAGE_SIZE,
      );
      setPosts((current) => (mode === "append" ? mergePosts(current, data) : data));
    } catch (error) {
      console.error("❌ Error al cargar feed para home:", error);
      if (mode === "replace") {
        setPosts([]);
        setFeedTotal(0);
        setHasMorePosts(false);
      }
    } finally {
      feedRequestInFlightRef.current = false;
      if (mode === "replace") {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    void fetchPosts(1, "replace");
  }, []);

  useEffect(() => {
    let active = true;

    const fetchHomeContext = async () => {
      const [profileResult, beersResult, placesResult] = await Promise.allSettled([
        currentUserId ? api.get(`/auth/profile/${currentUserId}`) : Promise.resolve(null),
        api.get("/beer/top-rated"),
        api.get("/places/top-rated"),
      ]);

      if (!active) return;

      if (profileResult.status === "fulfilled" && profileResult.value) {
        const profilePayload = normalizeProfilePayload(profileResult.value.data, currentUserId);
        setProfileStats(profilePayload.stats);

        const mergedUser = normalizeStoredAuthUser(
          { ...(user ?? {}), ...(profilePayload.user ?? {}) },
          currentUserId,
        );

        if (
          mergedUser &&
          (user?._id !== mergedUser._id ||
            user?.username !== mergedUser.username ||
            user?.email !== mergedUser.email ||
            currentUserAvatar !==
              (mergedUser.fotoPerfil || mergedUser.photo || mergedUser.profilePicture || ""))
        ) {
          const token = getStoredToken();
          if (token) {
            persistAuthSession({ token, user: mergedUser });
          }
          setUser(mergedUser);
        }
      }

      if (beersResult.status === "fulfilled") {
        const beers = extractListFromPayload<HomeBeer>(beersResult.value.data);
        setTrendingBeers(beers);
      }

      if (placesResult.status === "fulfilled") {
        const places = extractListFromPayload<HomePlace>(placesResult.value.data);
        setFeaturedPlaces(places);
      }
    };

    void fetchHomeContext();

    return () => {
      active = false;
    };
  }, [currentUserAvatar, currentUserId, setUser, user]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HOME_WIDGET_STORAGE_KEY);
      const storedCollapsed = localStorage.getItem(HOME_WIDGET_COLLAPSED_STORAGE_KEY);

      const restoredEnabled = sanitizeHomeWidgetIds(stored ? JSON.parse(stored) : null);
      const nextEnabled = restoredEnabled.length > 0 ? restoredEnabled : DEFAULT_HOME_WIDGETS;
      setEnabledWidgets(nextEnabled);

      const restoredCollapsed = sanitizeHomeWidgetIds(
        storedCollapsed ? JSON.parse(storedCollapsed) : null,
      ).filter((id) => nextEnabled.includes(id));
      setCollapsedWidgets(restoredCollapsed);
    } catch (error) {
      console.error("No pudimos restaurar los widgets del home:", error);
    } finally {
      widgetPrefsHydratedRef.current = true;
    }

    try {
      const storedRight = localStorage.getItem(RIGHT_WIDGET_STORAGE_KEY);
      const storedRightCollapsed = localStorage.getItem(RIGHT_WIDGET_COLLAPSED_STORAGE_KEY);
      const restoredRight = sanitizeRightWidgetIds(storedRight ? JSON.parse(storedRight) : null);
      setRightWidgets(restoredRight.length > 0 ? restoredRight : DEFAULT_RIGHT_WIDGETS);
      const restoredRightCollapsed = sanitizeRightWidgetIds(
        storedRightCollapsed ? JSON.parse(storedRightCollapsed) : null,
      );
      setCollapsedRightWidgets(restoredRightCollapsed);
    } catch {
      // keep defaults
    } finally {
      rightWidgetPrefsHydratedRef.current = true;
    }
  }, []);

  const feedPool = useMemo(() => {
    return mapPostsToFeed(posts);
  }, [posts]);

  const visibleFeed = useMemo(() => {
    return feedPool.map((base, index) => ({
      ...base,
      renderId: `${base.id}-${base.createdAt}-${index}`,
      lap: Math.floor(index / FEED_PAGE_SIZE),
    }));
  }, [feedPool]);

  const totalLikes = useMemo(() => feedPool.reduce((sum, item) => sum + item.likes, 0), [feedPool]);
  const feedItemCount = feedTotal ?? feedPool.length;
  const projectedComments = useMemo(
    () => Math.max(feedItemCount * 3, Math.round(totalLikes * 0.48)),
    [feedItemCount, totalLikes],
  );
  const trendingStyles = useMemo(() => mapBeersToStylePulse(trendingBeers), [trendingBeers]);
  const featuredRoutes = useMemo(() => mapPlacesToRoutes(featuredPlaces), [featuredPlaces]);
  const levelProgress = useMemo(() => buildLevelProgress(profileStats), [profileStats]);
  const displayName = getDisplayName(normalizeStoredAuthUser(user, currentUserId));
  const projectedPlans = useMemo(
    () => Math.max(featuredRoutes.length * 4, feedItemCount + 8),
    [featuredRoutes.length, feedItemCount],
  );
  const remainingXp = Math.max(0, levelProgress.targetXp - levelProgress.currentXp);
  const availableWidgets = useMemo(
    () => HOME_WIDGET_REGISTRY.filter((widget) => !enabledWidgets.includes(widget.id)),
    [enabledWidgets],
  );
  const hasCustomizedWidgets = useMemo(
    () =>
      collapsedWidgets.length > 0 ||
      enabledWidgets.length !== DEFAULT_HOME_WIDGETS.length ||
      enabledWidgets.some((widgetId, index) => widgetId !== DEFAULT_HOME_WIDGETS[index]),
    [collapsedWidgets.length, enabledWidgets],
  );
  const leadStyle = trendingStyles[0];
  const leadRoute = featuredRoutes[0];
  const heroSignals = useMemo(
    () => [
      {
        eyebrow: "Muro activo",
        value: formatCount(feedItemCount),
        detail: "historias listas para descubrir",
      },
      {
        eyebrow: "Votos",
        value: formatCount(totalLikes),
        detail: "reacciones que ya movieron el día",
      },
      {
        eyebrow: "Siguiente nivel",
        value: `${formatCount(remainingXp)} XP`,
        detail: `para pasar a nivel ${levelProgress.level + 1}`,
      },
    ],
    [feedItemCount, levelProgress.level, remainingXp, totalLikes],
  );
  const heroSpotlight = useMemo(() => {
    if (leadStyle && leadRoute) {
      return `${leadStyle.name} está marcando el tono y ${leadRoute.title} ya se siente como el plan más tentador para salir del scroll.`;
    }

    if (leadStyle) {
      return `${leadStyle.name} viene empujando la conversación y puede ser tu siguiente descubrimiento.`;
    }

    if (leadRoute) {
      return `${leadRoute.title} está listo para convertir el ruido del muro en una salida real.`;
    }

    return `Tu home ya tiene ${formatCount(feedItemCount)} historias activas para mirar, comentar o convertir en plan.`;
  }, [feedItemCount, leadRoute, leadStyle]);
  const feedIntroBadges = useMemo(() => {
    const badges = [
      `${formatCount(feedItemCount)} historias activas`,
      `${formatCount(projectedComments)} comentarios en movimiento`,
    ];

    if (leadStyle) {
      badges.push(`${leadStyle.name} está dando de qué hablar`);
    } else {
      badges.push(`${formatCount(projectedPlans)} planes listos para salir`);
    }

    return badges;
  }, [feedItemCount, leadStyle, projectedComments, projectedPlans]);
  const showHomeIntro = false;
  const showHomeWidgets = false;
  const showFeedLeadCard = false;

  const addWidget = (id: HomeWidgetId) => {
    setEnabledWidgets((current) => (current.includes(id) ? current : [...current, id]));
    setCollapsedWidgets((current) => current.filter((widgetId) => widgetId !== id));
  };

  const removeWidget = (id: HomeWidgetId) => {
    setEnabledWidgets((current) => current.filter((widgetId) => widgetId !== id));
    setCollapsedWidgets((current) => current.filter((widgetId) => widgetId !== id));
  };

  const toggleWidgetCollapsed = (id: HomeWidgetId) => {
    setCollapsedWidgets((current) =>
      current.includes(id) ? current.filter((widgetId) => widgetId !== id) : [...current, id],
    );
  };

  const expandAllWidgets = () => {
    setCollapsedWidgets([]);
  };

  const restoreDefaultWidgets = () => {
    setEnabledWidgets(DEFAULT_HOME_WIDGETS);
    setCollapsedWidgets([]);
    setPickerOpen(false);
  };

  const addRightWidget = (id: RightWidgetId) => {
    setRightWidgets((current) => (current.includes(id) ? current : [...current, id]));
    setCollapsedRightWidgets((current) => current.filter((wid) => wid !== id));
  };

  const removeRightWidget = (id: RightWidgetId) => {
    setRightWidgets((current) => current.filter((wid) => wid !== id));
    setCollapsedRightWidgets((current) => current.filter((wid) => wid !== id));
  };

  const toggleRightWidgetCollapsed = (id: RightWidgetId) => {
    setCollapsedRightWidgets((current) =>
      current.includes(id) ? current.filter((wid) => wid !== id) : [...current, id],
    );
  };

  const availableRightWidgets = useMemo(
    () => RIGHT_WIDGET_REGISTRY.filter((w) => !rightWidgets.includes(w.id)),
    [rightWidgets],
  );

  useEffect(() => {
    if (!widgetPrefsHydratedRef.current) return;

    localStorage.setItem(HOME_WIDGET_STORAGE_KEY, JSON.stringify(enabledWidgets));
    if (enabledWidgets.length === HOME_WIDGET_REGISTRY.length) {
      setPickerOpen(false);
    }
  }, [enabledWidgets]);

  useEffect(() => {
    if (!widgetPrefsHydratedRef.current) return;

    const nextCollapsed = collapsedWidgets.filter((id) => enabledWidgets.includes(id));
    if (nextCollapsed.length !== collapsedWidgets.length) {
      setCollapsedWidgets(nextCollapsed);
      return;
    }

    localStorage.setItem(HOME_WIDGET_COLLAPSED_STORAGE_KEY, JSON.stringify(nextCollapsed));
  }, [collapsedWidgets, enabledWidgets]);

  useEffect(() => {
    if (!rightWidgetPrefsHydratedRef.current) return;
    localStorage.setItem(RIGHT_WIDGET_STORAGE_KEY, JSON.stringify(rightWidgets));
  }, [rightWidgets]);

  useEffect(() => {
    if (!rightWidgetPrefsHydratedRef.current) return;
    localStorage.setItem(RIGHT_WIDGET_COLLAPSED_STORAGE_KEY, JSON.stringify(collapsedRightWidgets));
  }, [collapsedRightWidgets]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isLoadingMore || !hasMorePosts) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - LOAD_MORE_THRESHOLD_PX;
      const enoughTimePassed = Date.now() - extendLockRef.current > 450;

      if (nearBottom && enoughTimePassed) {
        extendLockRef.current = Date.now();
        void fetchPosts(feedPage + 1, "append");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [feedPage, hasMorePosts, isLoading, isLoadingMore]);

  const renderWidget = (
    id: HomeWidgetId,
    options: { headerActions: React.ReactNode; collapsed: boolean },
  ) => {
    const { headerActions, collapsed } = options;

    switch (id) {
      case "style-pulse":
        return (
          <SidebarWidget
            eyebrow="Ruido"
            title="Estilos y antojos que hoy vienen subiendo"
            actionLabel="Ver cervezas"
            actionHref="/cervezas"
            headerActions={headerActions}
            collapsed={collapsed}
            collapsedNote={`${trendingStyles[0]?.name || "Los estilos del día"} y ${Math.max(
              trendingStyles.length - 1,
              0,
            )} más siguen empujando conversación.`}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <SidebarWidgetMetric value={String(trendingStyles.length)} label="estilos" />
              <SidebarWidgetMetric value="hoy" label="en subida" />
            </div>

            <SidebarWidgetList>
              {trendingStyles.map((item, index) => (
                <SidebarWidgetItem
                  key={`${item.name}-${index}`}
                  href="/cervezas"
                  icon={item.icon}
                  title={item.name}
                  description={item.note}
                  badge={`top ${index + 1}`}
                  ctaLabel="Descubrir"
                />
              ))}
            </SidebarWidgetList>
          </SidebarWidget>
        );

      case "routes":
        return (
          <SidebarWidget
            eyebrow="Salir"
            title="Planes listos para pasar de mirar a salir"
            actionLabel="Ver rutas"
            actionHref="/lugares"
            headerActions={headerActions}
            collapsed={collapsed}
            collapsedNote={`${featuredRoutes.length} planes listos para salir del scroll y entrar a la calle.`}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <SidebarWidgetMetric value={String(featuredRoutes.length)} label="planes" />
              <SidebarWidgetMetric value="listos" label="para salir" />
            </div>

            <SidebarWidgetList>
              {featuredRoutes.map((route, index) => (
                <SidebarWidgetItem
                  key={route.title}
                  href="/lugares"
                  icon={route.icon}
                  title={route.title}
                  description={route.detail}
                  badge={index === 0 ? "hot" : undefined}
                  ctaLabel="Ver ruta"
                />
              ))}
            </SidebarWidgetList>
          </SidebarWidget>
        );

      case "level":
        return (
          <SidebarWidget
            eyebrow="Nivel"
            title={`Vas en ${levelProgress.rankName}`}
            actionLabel="Mi perfil"
            actionHref="/auth/perfil"
            headerActions={headerActions}
            collapsed={collapsed}
            collapsedNote={`${levelProgress.currentXp} / ${levelProgress.targetXp} XP. Te faltan ${remainingXp} para el siguiente nivel.`}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <SidebarWidgetMetric value={`Lv ${levelProgress.level}`} label="actual" />
              <SidebarWidgetMetric value={`${remainingXp}`} label="xp faltan" />
            </div>

            <div
              className="rounded-[1.2rem] border p-3"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {levelProgress.currentXp} / {levelProgress.targetXp} XP
                  </p>
                  <p
                    className="mt-1 text-sm font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Próximo nivel: {levelProgress.level + 1}
                  </p>
                </div>
                <div
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase"
                  style={{
                    background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
                    color: "var(--color-amber-primary)",
                  }}
                >
                  {levelProgress.progressPercent.toFixed(0)}%
                </div>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${levelProgress.progressPercent}%`,
                    background: "var(--gradient-button-primary)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <p
                className="mt-3 text-[12px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Cada post, like y hallazgo cervecero mueve esta barra. Te faltan {remainingXp} XP
                para subir.
              </p>
            </div>
          </SidebarWidget>
        );

      case "momentum":
        return (
          <SidebarWidget
            eyebrow="Pulso"
            title="Cómo viene tu home ahora"
            actionLabel="Abrir muro"
            actionHref="/posts"
            headerActions={headerActions}
            collapsed={collapsed}
            collapsedNote={`${feedItemCount} historias, ${totalLikes} likes y ${projectedComments} comentarios proyectados.`}
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: String(feedItemCount), label: "historias" },
                { value: String(totalLikes), label: "likes" },
                { value: String(projectedComments), label: "coment." },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1rem] border px-2.5 py-2 text-center"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <p className="text-sm font-black" style={{ color: "var(--color-text-primary)" }}>
                    {metric.value}
                  </p>
                  <p
                    className="mt-1 text-[9px] font-semibold tracking-[0.16em] uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {[
                {
                  title: "Lo más vivo del día",
                  detail: `${trendingStyles[0]?.name || "Las IPA"} sigue empujando conversación.`,
                },
                {
                  title: "Próximo plan para salir",
                  detail: `${featuredRoutes[0]?.title || "Una ruta nueva"} está lista para abrirse.`,
                },
                {
                  title: "Actividad proyectada",
                  detail: `${projectedPlans} planes y ${projectedComments} comentarios pueden moverse hoy.`,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1rem] border px-3 py-2.5"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                    background: "rgba(255,255,255,0.025)",
                  }}
                >
                  <p
                    className="text-[12px] font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="mt-1 text-[11px] leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </SidebarWidget>
        );

      default:
        return null;
    }
  };

  const renderRightWidget = (id: RightWidgetId) => {
    switch (id) {
      case "trending":
        return (
          <div className="space-y-2">
            {trendingStyles.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="rounded-[1.1rem] border px-3 py-2.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {item.icon} {item.name}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {item.note}
                </p>
              </div>
            ))}
            <Link
              href="/cervezas"
              className="flex items-center justify-between rounded-[1rem] border px-3 py-2 transition-all hover:translate-y-[-1px]"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, var(--color-border-light))",
                background: "color-mix(in srgb, var(--color-amber-primary) 5%, transparent)",
              }}
            >
              <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                Ver todas las cervezas
              </span>
              <span className="text-[11px]" style={{ color: "var(--color-amber-primary)" }}>→</span>
            </Link>
          </div>
        );

      case "rw-places":
        return (
          <div className="space-y-2">
            {featuredRoutes.map((route) => (
              <Link
                key={route.title}
                href="/lugares"
                className="block rounded-[1.1rem] border px-3 py-2.5 transition-all hover:translate-y-[-1px]"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {route.icon} {route.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {route.detail}
                </p>
              </Link>
            ))}
          </div>
        );

      case "rw-level": {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black" style={{ color: "var(--color-text-primary)" }}>
                  Nivel {levelProgress.level}
                </p>
                <p className="text-[10px]" style={{ color: "var(--color-amber-primary)" }}>
                  {levelProgress.rankName}
                </p>
              </div>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-base font-black"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow-sm)",
                }}
              >
                {levelProgress.level}
              </div>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--color-amber-primary), #f97316)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${levelProgress.progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              {levelProgress.currentXp} / {levelProgress.targetXp} XP para nivel {levelProgress.level + 1}
            </p>
          </div>
        );
      }

      case "rw-pulse":
        return (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { value: formatCount(feedItemCount), label: "historias" },
              { value: formatCount(totalLikes), label: "likes" },
              { value: formatCount(projectedComments), label: "coment." },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-[0.9rem] border px-2 py-2 text-center"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="text-sm font-black" style={{ color: "var(--color-text-primary)" }}>
                  {metric.value}
                </p>
                <p className="mt-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--color-text-muted)" }}>
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GoldenParticles count={22} />
      <Navbar />

      <main className="home-laptop-viewport relative overflow-hidden pt-0 pb-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "var(--gradient-home-backdrop)",
          }}
        />

        <div className="relative mx-auto flex max-w-[1340px] flex-col px-4 sm:px-6 lg:px-8">
          {showHomeIntro ? (
            <>
              {/* ─── Welcome + Gamification Banner ─── */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-2 flex flex-col items-start gap-4 overflow-hidden rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(249,115,22,0.05) 100%)",
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 45%, transparent)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Left: greeting */}
                <div className="flex min-w-0 items-center gap-3">
                  <motion.span
                    className="shrink-0 text-xl"
                    animate={{ rotate: [0, 12, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                  >
                    🍺
                  </motion.span>
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      ¡Hola de nuevo, @{displayName}! — Da likes, publica y sube de nivel en la
                      comunidad cervecera
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      Cada interacción suma XP y construye tu reputación 🏅
                    </p>
                  </div>
                </div>

                {/* Right: XP bar */}
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Nivel {levelProgress.level} · {levelProgress.rankName}
                    </span>
                    <motion.div
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                      style={{
                        background: "var(--gradient-button-primary)",
                        color: "var(--color-text-dark)",
                      }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      ⭐
                    </motion.div>
                  </div>
                  <div
                    className="h-1.5 w-32 overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, var(--color-amber-primary), #f97316)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${levelProgress.progressPercent}%` }}
                      transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                    {levelProgress.currentXp} / {levelProgress.targetXp} XP para Nivel{" "}
                    {levelProgress.level + 1}
                  </p>
                </div>

                <div className="w-full sm:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Nivel {levelProgress.level} · {levelProgress.rankName}
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {levelProgress.currentXp} / {levelProgress.targetXp} XP
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, var(--color-amber-primary), #f97316)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${levelProgress.progressPercent}%` }}
                      transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              <section
                className="relative overflow-hidden rounded-[2rem] border px-5 py-5 sm:px-6"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 36%, transparent)",
                  boxShadow: "var(--shadow-elevated)",
                }}
              >
                <div
                  className="pointer-events-none absolute top-[-5rem] -right-14 h-48 w-48 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--color-amber-primary) 18%, transparent) 0%, transparent 74%)",
                    filter: "blur(18px)",
                    opacity: 0.8,
                  }}
                />
                <div
                  className="pointer-events-none absolute bottom-[-6rem] left-[8%] h-44 w-44 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, color-mix(in srgb, var(--color-orange-cta) 16%, transparent) 0%, transparent 74%)",
                    filter: "blur(20px)",
                    opacity: 0.66,
                  }}
                />

                <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_360px] xl:items-stretch">
                  <div className="max-w-3xl xl:py-1">
                    <span
                      className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.24em] uppercase"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-amber) 70%, transparent)",
                        color: "var(--color-amber-primary)",
                        background: "rgba(251,191,36,0.06)",
                      }}
                    >
                      ✨ Tu espacio cervecero
                    </span>
                    <h1 className="mt-3 max-w-3xl text-2xl leading-snug font-extrabold sm:text-[1.75rem] xl:text-[2rem]">
                      Bienvenido a{" "}
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 40%, #f97316 100%)",
                          backgroundSize: "300% 300%",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          animation: "magic-gradient-shift 4s ease-in-out infinite",
                        }}
                      >
                        Lúpulos
                      </span>{" "}
                      — publica tu boti, tu pub, tu cerveza favorita y súmate a esta nueva
                      comunidad.
                    </h1>
                    <p
                      className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {heroSpotlight}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        "🍺 publica tu chela ahora",
                        "📍 arma una salida",
                        "🏅 gana puntos con cada like",
                      ].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[1.75rem] border p-4 sm:p-5"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent), color-mix(in srgb, var(--color-surface-card) 94%, transparent))",
                      borderColor: "color-mix(in srgb, var(--color-border-light) 78%, transparent)",
                      boxShadow:
                        "inset 0 1px 0 color-mix(in srgb, white 12%, transparent), var(--shadow-card)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="text-[11px] font-bold tracking-[0.22em] uppercase"
                          style={{ color: "var(--color-amber-primary)" }}
                        >
                          Ahora mismo
                        </p>
                        <p
                          className="mt-1 text-sm font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          Una home más viva, útil y centrada en el muro.
                        </p>
                      </div>
                      <span
                        className="rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--color-border-amber) 68%, transparent)",
                          background: "rgba(251,191,36,0.07)",
                          color: "var(--color-amber-primary)",
                        }}
                      >
                        home 2.0
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      {heroSignals.map((signal) => (
                        <div
                          key={signal.eyebrow}
                          className="rounded-[1.25rem] border px-3.5 py-3"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <p
                            className="text-[10px] font-bold tracking-[0.18em] uppercase"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {signal.eyebrow}
                          </p>
                          <p
                            className="mt-2 text-[1.05rem] leading-none font-black"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {signal.value}
                          </p>
                          <p
                            className="mt-2 text-[12px] leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {signal.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {QUICK_ACTIONS.slice(0, 2).map((action) => (
                        <Link
                          key={`hero-${action.href}`}
                          href={action.href}
                          className="flex items-center justify-between rounded-[1.15rem] border px-3.5 py-3 transition-transform hover:translate-y-[-1px]"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <span
                            className="flex items-center gap-2 text-[13px] font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            <span>{action.icon}</span>
                            {action.label}
                          </span>
                          <span style={{ color: "var(--color-text-muted)" }}>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {showHomeWidgets ? (
            <div className="order-last mt-4 space-y-4 xl:hidden">
              <section
                className="overflow-hidden rounded-[1.7rem] border p-4"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p
                      className="text-[11px] font-bold tracking-[0.24em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Accesos app
                    </p>
                    <h2
                      className="mt-2 text-xl leading-tight font-black"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Todo lo clave en dos toques
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div
                      className="rounded-2xl border px-3 py-2"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        className="text-sm font-black"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {feedItemCount}
                      </p>
                      <p
                        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Historias
                      </p>
                    </div>
                    <div
                      className="rounded-2xl border px-3 py-2"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        className="text-sm font-black"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {projectedComments}
                      </p>
                      <p
                        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Comentarios
                      </p>
                    </div>
                    <div
                      className="rounded-2xl border px-3 py-2"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        className="text-sm font-black"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {projectedPlans}
                      </p>
                      <p
                        className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Planes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between rounded-[1.2rem] border px-3.5 py-3 transition-transform hover:translate-y-[-1px]"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        <span>{action.icon}</span>
                        {action.label}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>→</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section
                className="overflow-hidden rounded-[1.7rem] border p-4"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p
                      className="text-[11px] font-bold tracking-[0.24em] uppercase"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      Ruido del día
                    </p>
                    <h2
                      className="mt-2 text-xl leading-tight font-black"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Estilos y planes que vienen empujando
                    </h2>
                  </div>
                  <Link
                    href="/lugares"
                    className="shrink-0 text-[12px] font-semibold"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Ver rutas
                  </Link>
                </div>

                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {trendingStyles.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="min-w-[240px] rounded-[1.25rem] border px-3.5 py-3"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {item.icon} {item.name}
                      </p>
                      <p
                        className="mt-1 text-[13px] leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {item.note}
                      </p>
                    </div>
                  ))}

                  {featuredRoutes.map((route) => (
                    <Link
                      key={route.title}
                      href="/lugares"
                      className="block min-w-[240px] rounded-[1.25rem] border px-3.5 py-3"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {route.icon} {route.title}
                      </p>
                      <p
                        className="mt-1 text-[13px] leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {route.detail}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          <div
            className={
              showHomeWidgets
                ? "mx-auto mt-3 grid w-full max-w-[1120px] gap-4 xl:grid-cols-[290px_minmax(0,780px)] xl:justify-center xl:gap-8"
                : rightWidgets.length > 0
                  ? "home-feed-shell mx-auto mt-3 flex w-full items-start gap-6"
                  : "home-feed-shell mx-auto w-full"
            }
            style={
              showHomeWidgets
                ? undefined
                : rightWidgets.length > 0
                  ? { maxWidth: `calc(${HOME_FEED_MAX_WIDTH} + 288px + 1.5rem)` }
                  : { maxWidth: HOME_FEED_MAX_WIDTH }
            }
          >
            {showHomeWidgets ? (
              <aside className="hidden min-h-0 xl:sticky xl:top-24 xl:flex xl:self-start">
                <SidebarWidgetRail
                  label={undefined}
                  actions={
                    <>
                      {availableWidgets.length > 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setPickerOpen((value) => !value)}
                          className="flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition-all"
                          style={{
                            borderColor: pickerOpen
                              ? "var(--color-amber-primary)"
                              : "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                            background: pickerOpen
                              ? "rgba(251,191,36,0.08)"
                              : "rgba(255,255,255,0.03)",
                            color: pickerOpen
                              ? "var(--color-amber-primary)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          <span className="text-sm leading-none">{pickerOpen ? "−" : "+"}</span>
                          Agregar
                        </motion.button>
                      ) : null}

                      {collapsedWidgets.length > 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={expandAllWidgets}
                          className="flex h-7 items-center rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase transition-all"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                            background: "rgba(255,255,255,0.03)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Expandir
                        </motion.button>
                      ) : null}

                      {hasCustomizedWidgets ? (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={restoreDefaultWidgets}
                          className="flex h-7 items-center rounded-full border px-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase transition-all"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                            background: "rgba(255,255,255,0.03)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Reset
                        </motion.button>
                      ) : null}
                    </>
                  }
                >
                  <AnimatePresence>
                    {pickerOpen ? (
                      <WidgetPickerCard options={availableWidgets} onAdd={addWidget} />
                    ) : null}
                  </AnimatePresence>

                  <Reorder.Group
                    axis="y"
                    values={enabledWidgets}
                    onReorder={(nextOrder) => setEnabledWidgets(sanitizeHomeWidgetIds(nextOrder))}
                    className="m-0 flex list-none flex-col gap-2.5 p-0"
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {enabledWidgets.map((widgetId) => {
                        const widgetMeta = HOME_WIDGET_REGISTRY.find(
                          (widget) => widget.id === widgetId,
                        );
                        if (!widgetMeta) return null;

                        return (
                          <HomeWidgetCard
                            key={widgetId}
                            id={widgetId}
                            label={widgetMeta.label}
                            collapsed={collapsedWidgets.includes(widgetId)}
                            onClose={() => removeWidget(widgetId)}
                            onToggleCollapse={() => toggleWidgetCollapsed(widgetId)}
                          >
                            {({ headerActions, collapsed }) =>
                              renderWidget(widgetId, { headerActions, collapsed })
                            }
                          </HomeWidgetCard>
                        );
                      })}
                    </AnimatePresence>
                  </Reorder.Group>

                  {enabledWidgets.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center rounded-[1.5rem] border py-8 text-center"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 55%, transparent)",
                      }}
                    >
                      <span className="text-3xl">🪟</span>
                      <p
                        className="mt-2 text-[12px] font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Cerraste todos los widgets. Abre el picker para volver a ponerlos.
                      </p>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={restoreDefaultWidgets}
                        className="mt-4 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase"
                        style={{
                          background: "var(--gradient-button-primary)",
                          color: "var(--color-text-dark)",
                          boxShadow: "var(--shadow-amber-glow)",
                        }}
                      >
                        Restaurar widgets
                      </motion.button>
                    </motion.div>
                  ) : null}
                </SidebarWidgetRail>
              </aside>
            ) : null}

            <section
              className={`min-w-0 ${showHomeWidgets ? "xl:mx-auto xl:w-full" : ""} ${!showHomeWidgets && rightWidgets.length > 0 ? "flex-1" : ""}`}
              style={!showHomeWidgets && rightWidgets.length > 0 ? { maxWidth: HOME_FEED_MAX_WIDTH } : undefined}
            >
              {/* ── Magic Composer ── */}
              <div className="home-feed-stack space-y-6 md:space-y-8 xl:space-y-10">
                {showFeedLeadCard ? (
                  <section
                    className="overflow-hidden rounded-[1.7rem] border px-4 py-4 sm:px-5"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
                      borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p
                          className="text-[11px] font-bold tracking-[0.24em] uppercase"
                          style={{ color: "var(--color-amber-primary)" }}
                        >
                          Muro en vivo
                        </p>
                        <h2
                          className="mt-2 text-[1.15rem] leading-tight font-black sm:text-[1.35rem]"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          Lo último de la comunidad cervecera, al centro y sin ruido extra.
                        </h2>
                        <p
                          className="mt-2 text-sm leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {heroSpotlight}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {feedIntroBadges.map((badge) => (
                          <span
                            key={badge}
                            className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                              background: "rgba(255,255,255,0.03)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {user && <div className="mb-2" style={{ marginTop: '8px' }}><MagicComposer onPostCreated={fetchPosts} /></div>}

                {isLoading ? (
                  <div className="w-full py-4">
                    <div
                      className="relative mx-auto w-full overflow-hidden rounded-[1.8rem] border px-5 py-6"
                      style={{
                        maxWidth: HOME_FEED_MAX_WIDTH,
                        background:
                          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 74%, transparent)",
                        boxShadow: "var(--shadow-elevated)",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-x-[14%] top-0 h-24 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, color-mix(in srgb, var(--color-amber-primary) 18%, transparent) 0%, transparent 72%)",
                          filter: "blur(34px)",
                          opacity: 0.7,
                        }}
                      />
                      <div className="relative animate-pulse">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full"
                            style={{ background: "rgba(255,255,255,0.09)" }}
                          />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div
                              className="h-3 w-28 rounded-full"
                              style={{ background: "rgba(255,255,255,0.12)" }}
                            />
                            <div
                              className="h-2.5 w-40 rounded-full"
                              style={{ background: "rgba(255,255,255,0.08)" }}
                            />
                          </div>
                        </div>

                        <div
                          className="mt-5 aspect-[4/5] w-full rounded-[1.35rem] sm:aspect-[16/10]"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                          }}
                        />

                        <div className="mt-5 space-y-3">
                          <div
                            className="h-3 w-full rounded-full"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                          />
                          <div
                            className="h-3 w-[82%] rounded-full"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          />
                          <div
                            className="h-3 w-[64%] rounded-full"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          />
                        </div>
                      </div>

                      <p
                        className="relative mt-5 text-center text-[0.92rem] font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Cargando muro...
                      </p>
                    </div>
                  </div>
                ) : visibleFeed.length === 0 ? (
                  <div
                    className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-[1.9rem] border px-6 py-16 text-center"
                    style={{
                      background: "var(--gradient-feed-empty-state)",
                      borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                      boxShadow: "var(--shadow-card)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-[16%] top-0 h-28 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, color-mix(in srgb, var(--color-amber-primary) 26%, transparent) 0%, transparent 72%)",
                        filter: "blur(34px)",
                        opacity: 0.85,
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-x-[28%] bottom-8 h-24 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, color-mix(in srgb, var(--color-orange-cta) 18%, transparent) 0%, transparent 74%)",
                        filter: "blur(32px)",
                        opacity: 0.72,
                      }}
                    />

                    <span className="relative z-10 text-5xl">🍺</span>
                    <h3
                      className="relative z-10 mt-4 text-lg font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      El muro está esperando tu primera historia
                    </h3>
                    <p
                      className="relative z-10 mt-2 max-w-md text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Publica lo que estás tomando y súmate a la comunidad.
                    </p>
                    <Link
                      href="/posts"
                      className="relative z-10 mt-5 rounded-full px-6 py-2.5 text-sm font-bold"
                      style={{
                        background: "var(--gradient-button-primary)",
                        color: "var(--color-text-dark)",
                        boxShadow: "var(--shadow-amber-glow)",
                      }}
                    >
                      Publicar ahora
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex snap-y snap-proximity flex-col gap-8">
                      {visibleFeed.map((item, index) => (
                        <FeedCard key={item.renderId} item={item} index={index} />
                      ))}
                    </div>

                    {isLoadingMore && (
                      <div className="mt-6 flex justify-center">
                        <p
                          className="text-[0.88rem] font-medium"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Cargando más historias...
                        </p>
                      </div>
                    )}

                    {!hasMorePosts && visibleFeed.length > 0 && (
                      <p
                        className="mt-6 text-center text-sm font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Llegaste al final del muro por ahora. Vuelve en un rato para ver nuevas
                        historias.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* ── Right widget panel ── */}
            {!showHomeWidgets && (
              <aside className="hidden w-72 shrink-0 xl:block xl:sticky xl:top-24 xl:self-start">
                <div className="flex flex-col gap-3">
                  {/* Add widget button */}
                  <div className="flex items-center justify-end px-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setRightPickerOpen((v) => !v)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border text-base transition-all"
                      style={{
                        borderColor: rightPickerOpen
                          ? "var(--color-amber-primary)"
                          : "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                        background: rightPickerOpen
                          ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                          : "rgba(255,255,255,0.04)",
                        color: rightPickerOpen
                          ? "var(--color-amber-primary)"
                          : "var(--color-text-muted)",
                      }}
                      aria-label="Agregar widget"
                    >
                      +
                    </motion.button>
                  </div>

                  {/* Picker */}
                  <AnimatePresence>
                    {rightPickerOpen ? (
                      <RightWidgetPicker
                        options={availableRightWidgets}
                        onAdd={addRightWidget}
                        onClose={() => setRightPickerOpen(false)}
                      />
                    ) : null}
                  </AnimatePresence>

                  {/* Widget cards */}
                  <AnimatePresence initial={false}>
                    {rightWidgets.map((id) => {
                      const meta = RIGHT_WIDGET_REGISTRY.find((w) => w.id === id);
                      if (!meta) return null;
                      return (
                        <RightWidgetCard
                          key={id}
                          label={meta.label}
                          collapsed={collapsedRightWidgets.includes(id)}
                          onClose={() => removeRightWidget(id)}
                          onToggleCollapse={() => toggleRightWidgetCollapsed(id)}
                        >
                          {renderRightWidget(id)}
                        </RightWidgetCard>
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty state */}
                  {rightWidgets.length === 0 && !rightPickerOpen ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center rounded-[1.4rem] border px-4 py-6 text-center"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-light) 55%, transparent)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <span className="text-2xl">🪟</span>
                      <p className="mt-2 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                        Sin widgets activos. Toca + para agregar.
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
