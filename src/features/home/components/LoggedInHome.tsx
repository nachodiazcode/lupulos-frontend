"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
} from "framer-motion";
import { useRouter } from "next/navigation";
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
  extractUploadedMedia,
  getPrimaryPostMedia,
  readVideoDurationSeconds,
  type PostMedia,
} from "@/lib/post-media";

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

const FEED_PAGE_SIZE = 8;
const LOAD_MORE_THRESHOLD_PX = 1200;

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
      const primaryMedia = getPrimaryPostMedia(post);
      const image = primaryMedia ? getImageUrl(primaryMedia.path) : "";
      const id = getPostId(post) || `post-${index}`;

      return {
        id,
        title,
        body,
        image,
        mediaType: primaryMedia?.type ?? null,
        author,
        likes: getLikeCount(post),
        likedByUsers: post.reacciones?.meGusta?.usuarios || post.reactions?.like?.users || [],
        createdAt: post.createdAt || post.updatedAt || new Date().toISOString(),
        route: getPostId(post) ? `/posts/${getPostId(post)}` : "/posts",
        kicker:
          primaryMedia?.type === "video"
            ? "Historia en video"
            : image
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

function FeedCard({
  item,
  index,
}: {
  item: FeedSeed & { renderId: string; lap: number };
  index: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const hasMedia = Boolean(item.image);
  const hasRealPost = item.route.startsWith("/posts/") && !item.id.startsWith("fallback");
  const currentUserId = user?._id || (user as { id?: string } | null)?.id || "";
  const [liked, setLiked] = useState(() =>
    currentUserId ? item.likedByUsers.includes(currentUserId) : false,
  );
  const [saved, setSaved] = useState(false);
  const [likedCount, setLikedCount] = useState(item.likes);
  const [savedCount, setSavedCount] = useState(Math.max(18, item.likes + 11));
  const [commentsOpen, setCommentsOpen] = useState(index === 0);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>(() => buildSeedComments(item, index));
  const currentUsername = getDisplayName(normalizeStoredAuthUser(user));
  const commentCount =
    comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0);

  useEffect(() => {
    if (!commentsOpen || !hasRealPost || commentsLoaded) return;

    let active = true;

    const loadComments = async () => {
      try {
        const res = await api.get(`/post/${item.id}/comments`);
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

        if (mapped.length > 0) {
          setComments(mapped);
        }
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
    if (!shareFeedback) return;
    const timer = window.setTimeout(() => setShareFeedback(""), 2200);
    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  const handleShareNative = async () => {
    const url = `${window.location.origin}${item.route}`;
    const text = `${item.title} — ${item.body}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url });
        setShareFeedback("Compartida desde tu dispositivo.");
        return;
      } catch {
        /* no-op */
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareFeedback("Texto y enlace listos para Instagram o Threads.");
    } catch {
      setShareFeedback("No pude copiar el enlace esta vez.");
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
    const text = encodeURIComponent(`${item.title} — ${item.body} ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.route}`);
      setShareFeedback("Enlace copiado. Listo para mandar al grupo.");
    } catch {
      setShareFeedback("No pude copiar el enlace.");
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
      await api.post(`/post/${item.id}/comments`, { content: optimisticComment.text });
    } catch (error) {
      console.error("❌ Error al publicar comentario desde el home:", error);
      setShareFeedback(
        "Tu comentario quedó local por ahora. Lo sincronizamos en el post completo.",
      );
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
      await api.post(`/post/${item.id}/react`, { type: "like" });
    } catch (error) {
      console.error("❌ Error al reaccionar al post:", error);
      // Revertir en caso de error
      setLiked(wasLiked);
      setLikedCount((count) => count + (wasLiked ? 1 : -1));
    }
  };

  const handleReplySubmit = (commentId: string) => {
    const draft = replyDrafts[commentId]?.trim();
    if (!draft) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: `${commentId}-reply-${Date.now()}`,
                  author: currentUsername,
                  text: draft,
                },
              ],
            }
          : comment,
      ),
    );

    setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
    setReplyingTo(null);
    setShareFeedback("Respuesta agregada al hilo del muro.");
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
        className="group relative w-full overflow-hidden rounded-[2rem] border xl:mx-auto xl:max-w-[29rem]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 90%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
          borderColor: "color-mix(in srgb, var(--color-border-amber) 34%, transparent)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div className="relative aspect-[9/14] overflow-hidden">
          {hasMedia ? (
            item.mediaType === "video" ? (
              <video
                src={item.image}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                muted
                playsInline
                preload="metadata"
                controls={false}
              />
            ) : (
              <Image
                src={item.image}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            )
          ) : (
            <div
              className="flex h-full w-full items-end"
              style={{
                background:
                  "radial-gradient(circle at top, rgba(251,191,36,0.28), transparent 48%), linear-gradient(180deg, rgba(36,16,0,0.94), rgba(18,8,0,1))",
              }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,8,3,0.06) 0%, rgba(15,8,3,0.18) 30%, rgba(15,8,3,0.72) 68%, rgba(8,4,1,0.92) 100%)",
            }}
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] uppercase"
                style={{
                  borderColor: "rgba(255,255,255,0.16)",
                  background: "rgba(10,6,2,0.44)",
                  color: "var(--color-amber-primary)",
                }}
              >
                {item.kicker}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
              >
                {item.mood}
              </span>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(8,4,1,0.4)", color: "rgba(255,255,255,0.82)" }}
            >
              loop {item.lap + 1}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <div className="rounded-[1.6rem] border bg-black/20 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white/90">@{item.author}</p>
                  <p className="text-[11px] font-medium text-white/60">{timeAgo(item.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                  <span>🍻 {likedCount}</span>
                  <span>•</span>
                  <span>{index + 1}</span>
                </div>
              </div>

              <h2 className="mt-3 text-2xl leading-[1.05] font-black text-white sm:text-[2rem]">
                {item.title}
              </h2>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-white/78">{item.body}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] font-semibold text-white/78">
                <button
                  type="button"
                  onClick={() => {
                    setSaved((value) => !value);
                    setSavedCount((count) => count + (saved ? -1 : 1));
                  }}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: saved ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  🍺 Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setCommentsOpen((value) => !value)}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: commentsOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  💬 Comentar
                </button>
                <button
                  type="button"
                  onClick={() => setShareOpen((value) => !value)}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: shareOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  📲 Compartir
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/72">
                <span
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  🍻 {likedCount} saludos
                </span>
                <span
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  💬 {commentCount} interacciones
                </span>
                <span
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  📚 {savedCount} guardados
                </span>
              </div>

              {commentsOpen && (
                <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-black/18 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold tracking-[0.18em] text-white/75 uppercase">
                      Conversación en curso
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(item.route)}
                      className="text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
                    >
                      Abrir post completo →
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {comments.slice(0, 3).map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-[1rem] border border-white/8 bg-white/5 p-3"
                      >
                        <p className="text-[13px] font-bold text-white/88">@{comment.author}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-white/72">
                          {comment.text}
                        </p>

                        {comment.replies.length > 0 && (
                          <div className="mt-2 space-y-2 border-l border-white/10 pl-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <p className="text-[12px] font-semibold text-white/80">
                                  @{reply.author}
                                </p>
                                <p className="text-[12px] leading-relaxed text-white/64">
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingTo((value) => (value === comment.id ? null : comment.id))
                            }
                            className="text-[12px] font-semibold text-white/64 transition-colors hover:text-white"
                          >
                            Responder
                          </button>
                          <span className="text-[11px] font-medium text-white/40">
                            {comment.source === "server" ? "del post" : "del muro"}
                          </span>
                        </div>

                        {replyingTo === comment.id && (
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <input
                              value={replyDrafts[comment.id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                              }
                              placeholder="Responder sin salir del muro..."
                              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
                            />
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(comment.id)}
                              className="rounded-full px-4 py-2 text-[12px] font-bold"
                              style={{ background: "rgba(251,191,36,0.16)", color: "#fff" }}
                            >
                              Responder
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Deja tu comentario y mantén vivo el muro..."
                      className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-[13px] text-white outline-none placeholder:text-white/38"
                    />
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment}
                      className="rounded-full px-4 py-3 text-[12px] font-bold disabled:opacity-60"
                      style={{
                        background: "var(--gradient-button-primary)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {isSubmittingComment ? "Publicando..." : "Comentar"}
                    </button>
                  </div>
                </div>
              )}

              {shareOpen && (
                <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-black/18 p-3">
                  <p className="text-[13px] font-bold tracking-[0.18em] text-white/74 uppercase">
                    Compartir esta cápsula
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                    Muévela rápido por Facebook, WhatsApp o por el share nativo del teléfono para
                    caer en Instagram o Threads.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      Facebook
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleShareNative}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      Instagram / Threads
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      Copiar link
                    </button>
                  </div>
                  {shareFeedback && (
                    <p className="mt-3 text-[12px] font-semibold text-white/70">{shareFeedback}</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  className="rounded-full border px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.02]"
                  style={{
                    borderColor: liked ? "rgba(251,191,36,0.32)" : "rgba(255,255,255,0.1)",
                    background: liked ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.05)",
                    color: "#fff",
                  }}
                >
                  {liked ? "💛 Saludado" : "🍻 Saludar"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(item.route)}
                  className="rounded-full px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.02]"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  Abrir historia
                </button>
                <Link
                  href="/posts"
                  className="text-sm font-semibold text-white/72 transition-colors hover:text-white"
                >
                  Ver todo el ruido →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SidePanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="overflow-hidden rounded-[1.7rem] border p-4"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
        borderColor: "color-mix(in srgb, var(--color-border-light) 78%, transparent)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p
        className="text-[11px] font-bold tracking-[0.24em] uppercase"
        style={{ color: "var(--color-amber-primary)" }}
      >
        {title}
      </p>
      <h3
        className="mt-2 text-xl leading-tight font-black"
        style={{ color: "var(--color-text-primary)" }}
      >
        {subtitle}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
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

function MagicComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const [focused, setFocused] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [composerError, setComposerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    for (const file of files) {
      if (file.type.startsWith("video/")) {
        try {
          const durationSeconds = await readVideoDurationSeconds(file);
          if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
            setComposerError("Los videos del muro pueden durar hasta 12 minutos.");
            continue;
          }
        } catch (error) {
          console.error("❌ Error al leer duración del video:", error);
          setComposerError("No pudimos leer uno de los videos seleccionados.");
          continue;
        }
      }

      acceptedFiles.push(file);
    }

    setMediaFiles((prev) => {
      const next = [...prev, ...acceptedFiles].slice(0, 4);
      if (prev.length + acceptedFiles.length > 4) {
        setComposerError("Puedes subir hasta 4 archivos por historia.");
      }
      return next;
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!contenido.trim() && mediaFiles.length === 0) return;
    setIsSubmitting(true);
    setComposerError("");

    try {
      const uploadedMediaItems: PostMedia[] = [];
      const uploadedPaths: string[] = [];
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append("media", file);
        if (file.type.startsWith("video/")) {
          const durationSeconds = await readVideoDurationSeconds(file);
          formData.append("durationSeconds", String(durationSeconds));
        }

        const res = await api.post(`/post/muro-vikingo/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const uploadedMedia = extractUploadedMedia(res.data);
        if (uploadedMedia?.path) {
          uploadedMediaItems.push(uploadedMedia);
          uploadedPaths.push(uploadedMedia.path);
        } else {
          throw new Error("Upload response did not include a media path");
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
    <div className="relative mb-6" style={{ borderRadius: 26, padding: 2 }}>
      {/* ── Aurora glow — soft outer halo ── */}
      <motion.div
        className="absolute -inset-[10px]"
        style={{
          borderRadius: 36,
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
          borderRadius: 26,
          background: neonBg,
          opacity: focused ? 1 : 0.6,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* ── Card body — liquid glass ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 24,
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

        <div className="px-5 py-4">
          {/* ── Top row: avatar + placeholder/textarea ── */}
          <div className="flex gap-3">
            {/* Avatar */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black"
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
                    className="w-full cursor-text rounded-2xl px-4 py-3 text-left text-sm transition-all"
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
                      className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed shadow-none outline-none placeholder:text-white/25 focus:outline-none"
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
                className="mt-3 flex gap-2 overflow-x-auto"
              >
                {mediaPreviews.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {mediaFiles[i]?.type.startsWith("video/") ? (
                      <video src={src} className="h-full w-full object-cover" muted />
                    ) : (
                      <Image src={src} alt="" fill className="object-cover" />
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
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
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "video/*";
                        fileInputRef.current.click();
                        fileInputRef.current.accept = "image/*,video/*";
                      }
                    }}
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
  const extendLockRef = useRef(0);
  const feedRequestInFlightRef = useRef(false);
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

  return (
    <>
      <GoldenParticles count={22} />
      <Navbar />

      <main className="relative overflow-hidden pt-2 pb-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(249,115,22,0.18), transparent 28%), radial-gradient(circle at top right, rgba(251,191,36,0.10), transparent 24%), linear-gradient(180deg, rgba(12,6,2,0.16), rgba(12,6,2,0.58) 42%, rgba(12,6,2,0.74) 100%)",
          }}
        />

        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
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
            className="overflow-hidden rounded-[2rem] border px-5 py-5 sm:px-6"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 90%, transparent))",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 36%, transparent)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,0.9fr)] xl:items-end">
              <div className="max-w-3xl">
                <span
                  className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.24em] uppercase"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-amber) 70%, transparent)",
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
                  — publica tu boti, tu pub, tu cerveza favorita y súmate a esta nueva comunidad.
                </h1>

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
            </div>
          </section>

          <div className="mt-4 space-y-4 xl:hidden">
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
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
                      borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
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

          <div className="mt-2 grid gap-2 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="hidden flex-col gap-4 xl:sticky xl:top-24 xl:flex xl:self-start">
              <SidePanel
                title="Entradas rápidas"
                subtitle="Abre algo bueno en menos de diez segundos"
              >
                <div className="grid gap-2.5">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between rounded-[1.2rem] border px-3.5 py-3 transition-transform hover:translate-x-1"
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
              </SidePanel>

              <SidePanel
                title="Radar del día"
                subtitle="Lo que hoy está acelerando las ganas de pedir otra"
              >
                <div className="space-y-3">
                  {trendingStyles.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[1.2rem] border px-3.5 py-3"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.025)",
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
                </div>
              </SidePanel>
            </aside>

            <section className="min-w-0">
              {/* ── Magic Composer ── */}
              {user && <MagicComposer onPostCreated={fetchPosts} />}

              {isLoading ? (
                <div className="flex flex-col gap-4 py-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                  ))}
                </div>
              ) : visibleFeed.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <span className="text-5xl">🍺</span>
                  <h3
                    className="mt-4 text-lg font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    El muro está esperando tu primera historia
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Publica lo que estás tomando y súmate a la comunidad.
                  </p>
                  <Link
                    href="/posts"
                    className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold"
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
                      <FeedCard
                        key={item.renderId}
                        item={item}
                        index={index}
                      />
                    ))}
                  </div>

                  {isLoadingMore && (
                    <div className="mt-6 flex flex-col gap-4">
                      {[1, 2].map((i) => (
                        <div
                          key={`feed-loading-${i}`}
                          className="h-32 animate-pulse rounded-2xl"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      ))}
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
            </section>

            <aside className="hidden flex-col gap-4 xl:sticky xl:top-24 xl:flex xl:self-start">
              <SidePanel title="Ruido del día" subtitle="Estilos y antojos que hoy vienen subiendo">
                <div className="space-y-3">
                  {trendingStyles.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-start gap-3 rounded-[1.2rem] border px-3.5 py-3"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span className="mt-0.5 text-base">{item.icon}</span>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {item.name}
                        </p>
                        <p
                          className="mt-1 text-[13px] leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SidePanel>

              <SidePanel
                title="Fuera del scroll"
                subtitle="Planes listos para pasar de mirar a salir"
              >
                <div className="space-y-3">
                  {featuredRoutes.map((route) => (
                    <Link
                      key={route.title}
                      href="/lugares"
                      className="block rounded-[1.2rem] border px-3.5 py-3 transition-transform hover:translate-y-[-1px]"
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
              </SidePanel>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
