"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { getImageUrl } from "@/lib/constants";
import { getPrimaryPostMedia, inferMediaType, type PostMedia } from "@/lib/post-media";
import { api } from "@/lib/api";

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
  views?: number;
  comments?: unknown[];
  commentsCount?: number;
  reacciones?: Record<string, ReactionData>;
  reactions?: Record<string, ReactionData>;
}

type ReactionData = { count?: number; users?: string[]; usuarios?: string[] };
type ReactionKey = "cheers" | "recommended" | "like";

interface PostComment {
  _id?: string;
  id?: string;
  content?: string;
  comentario?: string;
  author?: Usuario;
  usuario?: Usuario;
  createdAt?: string;
  parentComment?: string | null;
}

interface PostCardProps {
  post: Post;
  myReactions: Record<ReactionKey, boolean>;
  onReact: (type: ReactionKey) => void;
  onClick: () => void;
  shareOpenId: string | null;
  onShareToggle: (id: string | null) => void;
  currentUser?: { _id?: string; id?: string; username?: string } | null;
  onCommented?: () => void;
}

/* ─── Animations ─── */
const cardPop: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring" as const, stiffness: 300, damping: 22 } 
  }
};

/* ─── Avatar Gradients ─── */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #10b981, #3b82f6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #10b981)",
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #ef4444, #f59e0b)",
];

function getAvatarGradient(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/* ─── Time ago helper ─── */
function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `hace ${years}a`;
  if (months > 0) return `hace ${months}m`;
  if (weeks > 0) return `hace ${weeks} sem`;
  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes}min`;
  return "ahora";
}

/* ─── Post getters ─── */
const getPostId = (post: Post) => post._id || post.id || "";
const getPostTitle = (post: Post) => post.titulo || post.title || "";
const getPostContent = (post: Post) => post.contenido || post.content || "";
const getPostImages = (post: Post) => post.imagenes || post.images || [];
const getPostUser = (post: Post) => post.usuario || post.author;
const getPostDate = (post: Post) => post.createdAt ?? post.updatedAt ?? "";
const SP_REACTION_KEY: Record<ReactionKey, string> = {
  cheers: "brindis",
  recommended: "recomendado",
  like: "meGusta",
};
const getReaction = (post: Post, key: ReactionKey): { count: number; users: string[] } => {
  const src = post.reactions?.[key] ?? post.reacciones?.[SP_REACTION_KEY[key]] ?? {};
  const users = src.users ?? src.usuarios ?? [];
  return { count: src.count ?? users.length, users };
};
const getCommentCount = (post: Post) =>
  Array.isArray(post.comments) ? post.comments.length : post.commentsCount ?? 0;
const getViews = (post: Post) => post.views ?? 0;
const getCommentText = (c: PostComment) => c.content || c.comentario || "";
const getCommentUser = (c: PostComment) => c.author || c.usuario;
const REACTION_META: { key: ReactionKey; on: string; off: string; label: string }[] = [
  { key: "cheers", on: "🍻", off: "🍺", label: "Brindis" },
  { key: "recommended", on: "👍", off: "👍", label: "Recomendado" },
  { key: "like", on: "❤️", off: "🤍", label: "Me gusta" },
];

export default function PostCard({
  post,
  myReactions,
  onReact,
  onClick,
  shareOpenId,
  onShareToggle,
  currentUser,
  onCommented,
}: PostCardProps) {
  const primaryMedia = getPrimaryPostMedia(post);
  const mediaPath = primaryMedia?.path || getPostImages(post)[0] || "";
  const mediaType = primaryMedia?.type || inferMediaType(mediaPath);
  const [imgError, setImgError] = useState(false);
  const username = getPostUser(post)?.username ?? "anon";
  const postId = getPostId(post);
  const isShareOpen = shareOpenId === postId;
  const content = getPostContent(post);
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = content.length > 120;

  /* ─── Comentarios inline ─── */
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentCount, setCommentCount] = useState(getCommentCount(post));
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);

  const toggleComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && !commentsLoaded) {
      setCommentsLoading(true);
      try {
        const res = await api.get(`/post/${postId}/comments`);
        const data: PostComment[] = Array.isArray(res.data?.data) ? res.data.data : [];
        setComments(data);
        setCommentCount(data.length);
      } catch {
        /* silent */
      } finally {
        setCommentsLoading(false);
        setCommentsLoaded(true);
      }
    }
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !currentUser || posting) return;
    setPosting(true);
    const optimistic: PostComment = {
      id: `tmp-${Date.now()}`,
      content: text,
      author: { username: currentUser.username || "Tú" },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    setCommentCount((c) => c + 1);
    setCommentText("");
    try {
      await api.post(`/post/${postId}/comments`, { content: text });
      onCommented?.();
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setCommentCount((c) => Math.max(0, c - 1));
    } finally {
      setPosting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    const text = replyText.trim();
    if (!text || !currentUser || replyPosting) return;
    setReplyPosting(true);
    const optimistic: PostComment = {
      id: `tmp-${Date.now()}`,
      content: text,
      author: { username: currentUser.username || "Tú" },
      createdAt: new Date().toISOString(),
      parentComment: parentId,
    };
    setComments((prev) => [...prev, optimistic]);
    setCommentCount((c) => c + 1);
    setReplyText("");
    setReplyTo(null);
    try {
      await api.post(`/post/${postId}/comments`, { content: text, parentComment: parentId });
      onCommented?.();
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setCommentCount((c) => Math.max(0, c - 1));
    } finally {
      setReplyPosting(false);
    }
  };

  /* Construye el árbol de hilos: top-level + respuestas agrupadas por su raíz */
  const commentById = new Map<string, PostComment>();
  comments.forEach((c) => commentById.set((c.id || c._id) as string, c));
  const rootOf = (c: PostComment): string => {
    let cur = c;
    let guard = 0;
    while (cur.parentComment && commentById.get(cur.parentComment) && guard < 30) {
      cur = commentById.get(cur.parentComment) as PostComment;
      guard += 1;
    }
    return (cur.id || cur._id) as string;
  };
  const topLevelComments = comments.filter((c) => !c.parentComment);
  const repliesByRoot = new Map<string, PostComment[]>();
  comments
    .filter((c) => c.parentComment)
    .forEach((c) => {
      const root = rootOf(c);
      const arr = repliesByRoot.get(root) || [];
      arr.push(c);
      repliesByRoot.set(root, arr);
    });
  repliesByRoot.forEach((arr) =>
    arr.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
  );

  const renderComment = (c: PostComment, isReply: boolean) => {
    const cu = getCommentUser(c)?.username ?? "anon";
    const cid = (c.id || c._id || "") as string;
    return (
      <div className="flex gap-2.5">
        <div
          className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${isReply ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]"}`}
          style={{ background: getAvatarGradient(cu) }}
        >
          {cu[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>{cu}</span>
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{timeAgo(c.createdAt || "")}</span>
          </div>
          <p className="text-[13px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>{getCommentText(c)}</p>
          {currentUser ? (
            <button
              onClick={() => { setReplyTo(replyTo === cid ? null : cid); setReplyText(""); }}
              className="mt-1 text-[11px] font-bold transition-colors hover:text-[var(--color-amber-primary)]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {replyTo === cid ? "Cancelar" : "Responder"}
            </button>
          ) : null}
          {replyTo === cid && currentUser ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply(cid)}
                placeholder={`Responder a @${cu}...`}
                autoFocus
                className="flex-1 rounded-full border bg-transparent px-3 py-1.5 text-[12px] outline-none"
                style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
              />
              <button
                onClick={() => submitReply(cid)}
                disabled={replyPosting || !replyText.trim()}
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all disabled:opacity-50"
                style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)" }}
              >
                {replyPosting ? "…" : "Responder"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    } catch {
      /* silent */
    }
    onShareToggle(null);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(`${window.location.origin}/posts/${postId}`);
    const text = encodeURIComponent(getPostTitle(post));
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    onShareToggle(null);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${getPostTitle(post)} - ${window.location.origin}/posts/${postId}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    onShareToggle(null);
  };

  return (
    <motion.div
      variants={cardPop}
      className="glass-card group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 w-full"
      style={{
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Sweep de brillo en hover */}
      <span
        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />

      {/* Header del Post */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onClick}>
          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: getAvatarGradient(username) }}
          >
            {username[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              {username}
            </span>
            <span className="block text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {timeAgo(getPostDate(post))}
            </span>
          </div>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          ···
        </button>
      </div>

      {/* Imagen / Video multimedia — solo cuando el post trae media */}
      {mediaPath && !imgError ? (
        <div
          className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer"
          style={{ background: "var(--color-surface-card-alt)" }}
          onClick={onClick}
        >
          {mediaType === "video" ? (
            <video
              src={getImageUrl(mediaPath)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={getImageUrl(mediaPath)}
              alt={getPostTitle(post)}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-102"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      ) : null}

      {/* Barra de acciones estilo Reddit: reacciones + comentarios + vistas + compartir */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 pb-1">
        {/* Reacciones (brindis / recomendado / me gusta) */}
        <div className="flex items-center gap-1.5">
          {REACTION_META.map(({ key, on, off, label }) => {
            const active = myReactions[key];
            const count = getReaction(post, key).count;
            return (
              <motion.button
                key={key}
                onClick={(e) => { e.stopPropagation(); onReact(key); }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                title={label}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold transition-all"
                style={{
                  borderColor: active
                    ? "var(--color-amber-primary)"
                    : "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                  background: active ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                  color: active ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active ? "on" : "off"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="text-[14px] leading-none"
                  >
                    {active ? on : off}
                  </motion.span>
                </AnimatePresence>
                <span>{count}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Meta: comentarios + vistas + compartir */}
        <div className="flex items-center gap-3 text-[12px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
          <button
            onClick={(e) => { e.stopPropagation(); void toggleComments(); }}
            className="flex items-center gap-1 transition-colors hover:text-[var(--color-text-primary)]"
            style={{ color: commentsOpen ? "var(--color-amber-primary)" : undefined }}
            title="Comentarios"
          >
            💬 {commentCount}
          </button>
          <span className="flex items-center gap-1" title="Vistas">
            👁 {getViews(post)}
          </span>
          {/* Share */}
          <div className="relative">
            <motion.button
              onClick={(e) => { e.stopPropagation(); onShareToggle(isShareOpen ? null : postId); }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="leading-none transition-colors hover:text-[var(--color-text-primary)]"
              title="Compartir"
            >
              ↗
            </motion.button>

            {/* Share dropdown */}
            <AnimatePresence>
              {isShareOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--color-border-light)] shadow-2xl"
                  style={{ background: "var(--color-surface-card)" }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <span>🔗</span> Copiar enlace
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareTwitter(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <span>🐦</span> Enviar a X
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <span>💬</span> Enviar a WhatsApp
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Área de texto de la publicación */}
      <div className="px-4 pt-1 pb-3 text-left">
        {getPostTitle(post) && (
          <h3 className="text-sm font-extrabold" style={{ color: "var(--color-text-primary)" }}>
            {getPostTitle(post)}
          </h3>
        )}
        {content && (
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <span className="font-bold text-[var(--color-text-primary)] mr-1.5">
              {username}
            </span>{" "}
            {shouldTruncate && !expanded ? (
              <>
                {content.slice(0, 120)}...{" "}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                  className="font-bold cursor-pointer underline text-[var(--color-text-muted)] hover:text-white"
                >
                  más
                </button>
              </>
            ) : (
              content
            )}
          </p>
        )}
      </div>

      {/* Comentarios inline */}
      <AnimatePresence initial={false}>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[var(--color-border-subtle)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3">
              {/* Caja para comentar */}
              {currentUser ? (
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitComment()}
                    placeholder="Escribe un comentario..."
                    className="flex-1 rounded-full border bg-transparent px-3.5 py-2 text-[13px] outline-none"
                    style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                  />
                  <button
                    onClick={submitComment}
                    disabled={posting || !commentText.trim()}
                    className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all disabled:opacity-50"
                    style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)" }}
                  >
                    {posting ? "…" : "Comentar"}
                  </button>
                </div>
              ) : (
                <p className="mb-3 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Inicia sesión para comentar.
                </p>
              )}

              {/* Lista de comentarios */}
              {commentsLoading ? (
                <p className="py-2 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Cargando comentarios…
                </p>
              ) : comments.length === 0 ? (
                <p className="py-2 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Sé el primero en comentar 🍻
                </p>
              ) : (
                <div className="space-y-3">
                  {topLevelComments.map((c) => {
                    const cid = (c.id || c._id || "") as string;
                    const replies = repliesByRoot.get(cid) || [];
                    return (
                      <div key={cid}>
                        {renderComment(c, false)}
                        {replies.length > 0 ? (
                          <div
                            className="mt-2 space-y-2.5 border-l pl-3"
                            style={{ marginLeft: "0.85rem", borderColor: "var(--color-border-subtle)" }}
                          >
                            {replies.map((r) => (
                              <div key={r.id || r._id}>{renderComment(r, true)}</div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Línea inferior decorativa hover */}
      <div
        className="h-[2.5px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background:
            "linear-gradient(90deg, var(--color-amber-primary), var(--color-orange-cta), transparent)",
        }}
      />
    </motion.div>
  );
}
