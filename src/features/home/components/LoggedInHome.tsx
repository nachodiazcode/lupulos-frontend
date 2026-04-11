"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenParticles from "@/features/landing/components/GoldenParticles";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import { getDisplayName } from "@/lib/auth-storage";

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
  author: string;
  likes: number;
  createdAt: string;
  route: string;
  kicker: string;
  mood: string;
}

interface FeedCommentApi {
  _id?: string;
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

type FeedMode = "para-ti" | "trending" | "nuevos";

const FEED_MODES: { id: FeedMode; label: string; hint: string }[] = [
  { id: "para-ti", label: "Para ti", hint: "Lo que engancha rápido y te deja queriendo otra historia" },
  { id: "trending", label: "En fuego", hint: "Lo que hoy está haciendo ruido en la comunidad" },
  { id: "nuevos", label: "Recién servido", hint: "Las historias frescas que acaban de caer al muro" },
];

const QUICK_ACTIONS = [
  { icon: "🍺", label: "Descubrir una cerveza ahora", href: "/cervezas" },
  { icon: "📍", label: "Armar una salida cervecera", href: "/lugares" },
  { icon: "💬", label: "Meterme al ruido del muro", href: "/posts" },
  { icon: "🤖", label: "Pedirle una recomendación a la IA", href: "/chat" },
];

const STYLE_PULSE = [
  { icon: "🌫️", name: "Hazy IPA", note: "la jugosa que convierte un vistazo en una segunda pinta" },
  { icon: "🖤", name: "Imperial Stout", note: "oscura, cremosa y demasiado buena para cerrar el scroll" },
  { icon: "🍋", name: "Sour cítrica", note: "afilada, frutal y perfecta para mandar por WhatsApp" },
  { icon: "🌲", name: "West Coast IPA", note: "seca, resinosa y con esa amargura que engancha" },
];

const ROUTES = [
  { icon: "📍", title: "Ruta taproom Santiago", detail: "cuatro paradas para salir con la primera cerveza ya decidida" },
  { icon: "🌊", title: "Valpo de pintas largas", detail: "barras con vista, conversación y ganas de quedarse otra ronda" },
  { icon: "🍔", title: "Maridajes para burger night", detail: "combinaciones que hacen que la mesa pida una segunda vuelta" },
];

const FALLBACK_FEED: FeedSeed[] = [
  {
    id: "fallback-1",
    title: "La ronda que está empujando más brindis esta semana",
    body: "Tres estilos, tres moods y una sola consecuencia: guardar la historia, comentarla y mandar el plan al grupo antes de que se te olvide.",
    image: "/assets/vikingos-cerveza.jpg",
    author: "Lúpulos",
    likes: 84,
    createdAt: new Date().toISOString(),
    route: "/posts",
    kicker: "Lo más comentable",
    mood: "🔥 Subiendo fuerte",
  },
  {
    id: "fallback-2",
    title: "Tu próxima cerveza favorita no debería tomarte veinte clics",
    body: "Por eso este home te la acerca con historias que mezclan hallazgos, contexto y ganas reales de salir a probarla.",
    image: "/assets/lupin.png",
    author: "Radar lupulero",
    likes: 61,
    createdAt: new Date().toISOString(),
    route: "/cervezas",
    kicker: "Descubrimiento express",
    mood: "🍻 Se está guardando",
  },
  {
    id: "fallback-3",
    title: "Bares que convierten una salida casual en una noche completa",
    body: "No se trata solo de la carta: se trata de la barra, la música, la conversa y esa primera pinta que empuja la segunda.",
    image: "/assets/gargola.png",
    author: "Mapas de salida",
    likes: 47,
    createdAt: new Date().toISOString(),
    route: "/lugares",
    kicker: "Plan listo",
    mood: "📍 Para hoy",
  },
];

const INITIAL_VISIBLE = 5;
const LOAD_MORE_BATCH = 4;

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

function getPostTitle(post: Post): string {
  return post.titulo || post.title || "";
}

function getPostContent(post: Post): string {
  return post.contenido || post.content || "";
}

function getPostImages(post: Post): string[] {
  return post.imagenes || post.images || [];
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
      const body = getPostContent(post) || "Una recomendación cervecera que merece un segundo vistazo.";
      const author = getPostUser(post)?.username || "Cervecero";
      const image = getPostImages(post)[0] ? getImageUrl(getPostImages(post)[0]) : "";
      const id = getPostId(post) || `post-${index}`;

      return {
        id,
        title,
        body,
        image,
        author,
        likes: getLikeCount(post),
        createdAt: post.createdAt || post.updatedAt || new Date().toISOString(),
        route: getPostId(post) ? `/posts/${getPostId(post)}` : "/posts",
        kicker: image ? "Historia visual" : "Dato para guardar",
        mood: getFeedMood(index),
      };
    })
    .filter((item) => item.title || item.body);
}

function buildSeedComments(item: FeedSeed, index: number): FeedComment[] {
  const commentSets = [
    [
      {
        author: "malta.norte",
        text: "Este tipo de historia es la que me hace guardar el plan al tiro. ¿Dónde partirías?",
        replies: [{ author: "lupulo.club", text: "Si hay hazy en la carta, yo parto por ahí sin pensarlo." }],
      },
      {
        author: "barra.artesanal",
        text: "La portada vende sola, pero el copy termina de empujarte.",
        replies: [{ author: "cerveza.y.ruta", text: "Sí, da ganas de mandarla al grupo y salir hoy." }],
      },
    ],
    [
      {
        author: "ipa.de.guardia",
        text: "Necesito más cápsulas así: una idea clara y cero humo.",
        replies: [{ author: "hops.and.friends", text: "Exacto. Ver, comentar, guardar y seguir bajando." }],
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
  const hasImage = Boolean(item.image);
  const hasRealPost = item.route.startsWith("/posts/") && !item.id.startsWith("fallback");
  const [liked, setLiked] = useState(false);
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
  const currentUsername = getDisplayName(user);
  const commentCount = comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0);

  useEffect(() => {
    if (!commentsOpen || !hasRealPost || commentsLoaded) return;

    let active = true;

    const loadComments = async () => {
      try {
        const res = await api.get(`/post/${item.id}/comentarios`);
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.comentarios || [];

        if (!active) return;

        const mapped = data
          .map((comment: FeedCommentApi, commentIndex: number) => ({
            id: comment._id || `${item.id}-server-${commentIndex}`,
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
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
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
      await api.post(`/post/${item.id}/comentario`, { content: optimisticComment.text });
    } catch (error) {
      console.error("❌ Error al publicar comentario desde el home:", error);
      setShareFeedback("Tu comentario quedó local por ahora. Lo sincronizamos en el post completo.");
    } finally {
      setIsSubmittingComment(false);
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
        className="group relative mx-auto w-full max-w-[29rem] overflow-hidden rounded-[2rem] border"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 90%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
          borderColor: "color-mix(in srgb, var(--color-border-amber) 34%, transparent)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        <div className="relative aspect-[9/14] overflow-hidden">
          {hasImage ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
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
                className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
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
                  <span>🍻 {item.likes}</span>
                  <span>•</span>
                  <span>{index + 1}</span>
                </div>
              </div>

              <h2 className="mt-3 text-2xl leading-[1.05] font-black text-white sm:text-[2rem]">
                {item.title}
              </h2>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-white/78">
                {item.body}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] font-semibold text-white/78">
                <button
                  type="button"
                  onClick={() => {
                    setSaved((value) => !value);
                    setSavedCount((count) => count + (saved ? -1 : 1));
                  }}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: saved ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.05)" }}
                >
                  🍺 Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setCommentsOpen((value) => !value)}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: commentsOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}
                >
                  💬 Comentar
                </button>
                <button
                  type="button"
                  onClick={() => setShareOpen((value) => !value)}
                  className="rounded-full border px-3 py-2 text-left transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: shareOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}
                >
                  📲 Compartir
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/72">
                <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                  🍻 {likedCount} saludos
                </span>
                <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                  💬 {commentCount} interacciones
                </span>
                <span className="rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                  📚 {savedCount} guardados
                </span>
              </div>

              {commentsOpen && (
                <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-black/18 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-white/75">
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
                        <p className="mt-1 text-[13px] leading-relaxed text-white/72">{comment.text}</p>

                        {comment.replies.length > 0 && (
                          <div className="mt-2 space-y-2 border-l border-white/10 pl-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <p className="text-[12px] font-semibold text-white/80">@{reply.author}</p>
                                <p className="text-[12px] leading-relaxed text-white/64">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setReplyingTo((value) => (value === comment.id ? null : comment.id))}
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
                              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
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
                      style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)" }}
                    >
                      {isSubmittingComment ? "Publicando..." : "Comentar"}
                    </button>
                  </div>
                </div>
              )}

              {shareOpen && (
                <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-black/18 p-3">
                  <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-white/74">
                    Compartir esta cápsula
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                    Muévela rápido por Facebook, WhatsApp o por el share nativo del teléfono para caer en Instagram o Threads.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                    >
                      Facebook
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleShareNative}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                    >
                      Instagram / Threads
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="rounded-full border px-4 py-2 text-left text-[12px] font-bold text-white/82"
                      style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
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
                  onClick={() => {
                    setLiked((value) => !value);
                    setLikedCount((count) => count + (liked ? -1 : 1));
                  }}
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
      <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--color-amber-primary)" }}>
        {title}
      </p>
      <h3 className="mt-2 text-xl leading-tight font-black" style={{ color: "var(--color-text-primary)" }}>
        {subtitle}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function LoggedInHome() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<FeedMode>("para-ti");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const extendLockRef = useRef(0);

  useEffect(() => {
    let active = true;

    const loadPosts = async () => {
      try {
        const res = await api.get("/post");
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.posts || [];
        if (active) {
          setPosts(data);
        }
      } catch (error) {
        console.error("❌ Error al cargar feed para home:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const feedPool = useMemo(() => {
    const normalized = mapPostsToFeed(posts);

    if (mode === "trending") {
      return [...normalized].sort((a, b) => b.likes - a.likes);
    }

    if (mode === "nuevos") {
      return [...normalized].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return [...normalized].sort((a, b) => {
      const scoreA = a.likes * 4 + new Date(a.createdAt).getTime() / 1_000_000;
      const scoreB = b.likes * 4 + new Date(b.createdAt).getTime() / 1_000_000;
      return scoreB - scoreA;
    });
  }, [mode, posts]);

  const visibleFeed = useMemo(() => {
    return feedPool.slice(0, visibleCount).map((base, index) => ({
      ...base,
      renderId: `${base.id}-${index}`,
      lap: 0,
    }));
  }, [feedPool, visibleCount]);

  const totalLikes = useMemo(
    () => feedPool.reduce((sum, item) => sum + item.likes, 0),
    [feedPool],
  );
  const projectedComments = useMemo(
    () => Math.max(feedPool.length * 3, Math.round(totalLikes * 0.48)),
    [feedPool.length, totalLikes],
  );
  const projectedPlans = useMemo(
    () => Math.max(ROUTES.length * 4, feedPool.length + 8),
    [feedPool.length],
  );

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [mode]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 1200;
      const enoughTimePassed = Date.now() - extendLockRef.current > 450;

      if (nearBottom && enoughTimePassed) {
        extendLockRef.current = Date.now();
        setVisibleCount((current) => current + LOAD_MORE_BATCH);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <GoldenParticles count={22} />
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-2">
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
            className="mb-2 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(249,115,22,0.05) 100%)",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 45%, transparent)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Left: greeting */}
            <div className="flex items-center gap-3 min-w-0">
              <motion.span
                className="text-xl shrink-0"
                animate={{ rotate: [0, 12, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              >
                🍺
              </motion.span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                  ¡Hola de nuevo, @{getDisplayName(user)}! — Da likes, publica y sube de nivel en la comunidad cervecera
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  Cada interacción suma XP y construye tu reputación 🏅
                </p>
              </div>
            </div>

            {/* Right: XP bar */}
            <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold" style={{ color: "var(--color-amber-primary)" }}>Nivel 1 · Lupulero</span>
                <motion.div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                  style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)" }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ⭐
                </motion.div>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--color-amber-primary), #f97316)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "24%" }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                />
              </div>
              <p className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>120 / 500 XP para Nivel 2</p>
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
                  className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em]"
                  style={{
                      borderColor: "color-mix(in srgb, var(--color-border-amber) 70%, transparent)",
                      color: "var(--color-amber-primary)",
                    background: "rgba(251,191,36,0.06)",
                  }}
                >
                  ✨ Tu espacio cervecero
                </span>
                <h1 className="mt-3 max-w-3xl text-2xl leading-snug sm:text-[1.75rem] xl:text-[2rem] font-extrabold">
                  Bienvenido a{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 40%, #f97316 100%)",
                      backgroundSize: "300% 300%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "magic-gradient-shift 4s ease-in-out infinite",
                    }}
                  >
                    Lúpulos
                  </span>
                  {" "}— publica tu boti, tu pub, tu cerveza favorita y súmate a esta nueva comunidad.
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
                        borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
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

          <div className="mt-2 grid gap-2 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
              <SidePanel title="Entradas rápidas" subtitle="Abre algo bueno en menos de diez segundos">
                <div className="grid gap-2.5">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between rounded-[1.2rem] border px-3.5 py-3 transition-transform hover:translate-x-1"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        <span>{action.icon}</span>
                        {action.label}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>→</span>
                    </Link>
                  ))}
                </div>
              </SidePanel>

              <SidePanel title="Radar del día" subtitle="Lo que hoy está acelerando las ganas de pedir otra">
                <div className="space-y-3">
                  {STYLE_PULSE.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[1.2rem] border px-3.5 py-3"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.025)",
                      }}
                    >
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {item.icon} {item.name}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </SidePanel>
            </aside>

            <section className="min-w-0">
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--color-amber-primary)" }}>
                  Muro vikingo
                </p>
                <h2 className="mt-1 text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
                  Historias que dan ganas de comentar, guardar y pasarle a alguien más
                </h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-4 py-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                  ))}
                </div>
              ) : visibleFeed.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <span className="text-5xl">🍺</span>
                  <h3 className="mt-4 text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                    El muro está esperando tu primera historia
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Publica lo que estás tomando y súmate a la comunidad.
                  </p>
                  <Link
                    href="/posts"
                    className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold"
                    style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                  >
                    Publicar ahora
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-8 snap-y snap-proximity">
                  {visibleFeed.map((item, index) => (
                    <FeedCard key={item.renderId} item={item} index={index} />
                  ))}
                </div>
              )}
            </section>

            <aside className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
              <SidePanel title="Ruido del día" subtitle="Estilos y antojos que hoy vienen subiendo">
                <div className="space-y-3">
                  {STYLE_PULSE.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-start gap-3 rounded-[1.2rem] border px-3.5 py-3"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span className="mt-0.5 text-base">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                          {item.name}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SidePanel>

              <SidePanel title="Fuera del scroll" subtitle="Planes listos para pasar de mirar a salir">
                <div className="space-y-3">
                  {ROUTES.map((route) => (
                    <Link
                      key={route.title}
                      href="/lugares"
                      className="block rounded-[1.2rem] border px-3.5 py-3 transition-transform hover:translate-y-[-1px]"
                      style={{
                        borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {route.icon} {route.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
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
