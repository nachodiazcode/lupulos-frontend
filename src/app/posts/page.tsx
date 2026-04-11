"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder, type Variants } from "framer-motion";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import { Modal, Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";

/* ─── Types ─── */
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

/* ─── Animations ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardPop: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/* ─── Sort chips ─── */
const SORT_OPTIONS = [
  { label: "🔥 Recientes", value: "recientes" },
  { label: "🏆 Más saludados", value: "likes" },
  { label: "📸 Con imagen", value: "imagen" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

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

/* ─── Avatar gradient backgrounds ─── */
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

/* ─── Widget Registry ─── */
const WIDGET_REGISTRY = [
  { id: "publicar",         emoji: "✏️", label: "Publicar" },
  { id: "tendencias",       emoji: "🔥", label: "Tendencias" },
  { id: "comunidad-stats",  emoji: "📊", label: "Comunidad" },
  { id: "filtros",          emoji: "🎯", label: "Filtros" },
] as const;

type WidgetId = (typeof WIDGET_REGISTRY)[number]["id"];
const DEFAULT_WIDGETS: WidgetId[] = ["publicar", "tendencias"];
const SIDEBAR_STORAGE_KEY = "posts_sidebar_widgets_v1";

/* ─── Instagram-style Post Card ─── */
function PostCard({
  post,
  liked,
  onLike,
  onClick,
  shareOpenId,
  onShareToggle,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
  shareOpenId: string | null;
  onShareToggle: (id: string | null) => void;
}) {
  const img = getPostImages(post)[0];
  const [imgError, setImgError] = useState(false);
  const username = getPostUser(post)?.username ?? "anon";
  const postId = getPostId(post);
  const isShareOpen = shareOpenId === postId;
  const content = getPostContent(post);
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = content.length > 120;

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
      className="group relative overflow-hidden rounded-2xl border backdrop-blur-sm"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onClick}>
          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: getAvatarGradient(username) }}
          >
            {username[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {username}
            </span>
            <span className="block text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {timeAgo(getPostDate(post))}
            </span>
          </div>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onClick={(e) => { e.stopPropagation(); }}
        >
          ···
        </button>
      </div>

      {/* ── Image ── */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer"
        style={{ background: "var(--color-surface-card-alt)" }}
        onClick={onClick}
      >
        {img && !imgError ? (
          <Image
            src={getImageUrl(img)}
            alt={getPostTitle(post)}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 select-none"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 50%, rgba(251,191,36,0.12) 100%)",
            }}
          >
            <span className="text-4xl">📝</span>
            <span
              className="max-w-[80%] text-center text-sm font-semibold leading-snug"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {getPostTitle(post)}
            </span>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-3">
          {/* Like */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="text-xl leading-none"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={liked ? "liked" : "not"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {liked ? "🍻" : "🤍"}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Comment */}
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-xl leading-none"
          >
            💬
          </motion.button>

          {/* Share */}
          <div className="relative">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onShareToggle(isShareOpen ? null : postId);
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="text-xl leading-none"
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
                  className="absolute left-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border"
                  style={{
                    background: "var(--color-surface-card)",
                    borderColor: "var(--color-border-light)",
                    boxShadow: "var(--shadow-elevated)",
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors"
                    style={{ color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>🔗</span> Copiar enlace
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareTwitter(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors"
                    style={{ color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>🐦</span> Compartir en Twitter
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors"
                    style={{ color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>💬</span> Compartir en WhatsApp
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Like count */}
        <span className="text-xs font-semibold" style={{ color: "var(--color-amber-primary)" }}>
          🍻 {getLikeCount(post)}
        </span>
      </div>

      {/* ── Content area ── */}
      <div className="px-4 pt-1 pb-2">
        {getPostTitle(post) && (
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {getPostTitle(post)}
          </h3>
        )}
        {content && (
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {username}
            </span>{" "}
            {shouldTruncate && !expanded ? (
              <>
                {content.slice(0, 120)}...{" "}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                  className="font-medium"
                  style={{ color: "var(--color-text-muted)" }}
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

      {/* ── Date ── */}
      <div className="px-4 pb-3">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          {timeAgo(getPostDate(post))}
        </span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════════════════
   Page
   ═════════════════════════════════ */
export default function PostPage() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [sort, setSort] = useState<SortKey>("recientes");
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);

  /* Widget state */
  const [sidebarDismissed, setSidebarDismissed] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [pickerOpen, setPickerOpen] = useState(false);

  /* Quick-post state for widget */
  const [widgetTitulo, setWidgetTitulo] = useState("");
  const [widgetContenido, setWidgetContenido] = useState("");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) setUser(JSON.parse(storedUser));
    fetchPosts();
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      try { setEnabledWidgets(JSON.parse(stored) as WidgetId[]); } catch { /* noop */ }
    }
  }, []);

  useEffect(() => {
    if (imagen) {
      const url = URL.createObjectURL(imagen);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagen]);

  /* Close share dropdown on outside click */
  useEffect(() => {
    if (!shareOpenId) return;
    const handler = () => setShareOpenId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [shareOpenId]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/post`);
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.posts || [];
      setPosts(data);
    } catch (err) {
      console.error("❌ Error al obtener posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    const userId = getUserId(user);
    if (!userId) return;
    try {
      await api.post(`/post/${postId}/react`, { type: "meGusta" });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al alternar like:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId(user);
    if (!userId) return;
    try {
      let imagePath = "";
      if (imagen) {
        const formData = new FormData();
        formData.append("imagen", imagen);
        const res = await api.post(`/post/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePath = res.data.path;
      }
      await api.post(`/post`, { titulo, contenido, imagenes: imagePath ? [imagePath] : [] });
      setTitulo("");
      setContenido("");
      setImagen(null);
      setPreview(null);
      setModalAbierto(false);
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al subir post:", err);
    }
  };

  const handleWidgetSubmit = async () => {
    const userId = getUserId(user);
    if (!userId || !widgetTitulo.trim()) return;
    try {
      await api.post(`/post`, { titulo: widgetTitulo, contenido: widgetContenido, imagenes: [] });
      setWidgetTitulo("");
      setWidgetContenido("");
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al subir post:", err);
    }
  };

  const toggleWidget = (id: WidgetId) => {
    setEnabledWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
      if (next.length === WIDGET_REGISTRY.length) setPickerOpen(false);
      return next;
    });
  };

  /* ─── Widget renderer ─── */
  const renderWidget = (id: WidgetId): React.ReactNode => {
    switch (id) {
      case "publicar":
        return (
          <div className="px-5 py-3">
            <div className="mb-2.5 flex items-center gap-2">
              <motion.span className="text-sm" animate={{ rotate: [0, 10, -5, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}>✏️</motion.span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Publicar</span>
            </div>
            {user ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={widgetTitulo}
                  onChange={(e) => setWidgetTitulo(e.target.value)}
                  placeholder="Título..."
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-[12px] outline-none"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                />
                <textarea
                  value={widgetContenido}
                  onChange={(e) => setWidgetContenido(e.target.value)}
                  placeholder="¿Qué quieres compartir?"
                  rows={2}
                  className="w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-[12px] outline-none"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleWidgetSubmit}
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold transition-all"
                  style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
                >
                  Publicar
                </motion.button>
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>Inicia sesión para publicar</p>
            )}
          </div>
        );

      case "tendencias":
        return (
          <div className="px-5 py-3">
            <div className="mb-2.5 flex items-center gap-2">
              <motion.span className="text-sm" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>🔥</motion.span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Tendencias</span>
            </div>
            <div className="space-y-1.5">
              {[...posts]
                .sort((a, b) => getLikeCount(b) - getLikeCount(a))
                .slice(0, 5)
                .map((p, i) => (
                  <motion.div
                    key={getPostId(p)}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 3 }}
                    onClick={() => router.push(`/posts/${getPostId(p)}`)}
                    className="group/trend flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "var(--color-amber-primary)" }}>#{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {getPostTitle(p) || "Sin título"}
                    </span>
                    <span className="shrink-0 text-[10px]" style={{ color: "var(--color-text-secondary)" }}>🍻 {getLikeCount(p)}</span>
                  </motion.div>
                ))}
              {posts.length === 0 && (
                <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>Sin publicaciones aún</p>
              )}
            </div>
          </div>
        );

      case "comunidad-stats":
        return (
          <div className="px-5 py-3">
            <div className="mb-2.5 flex items-center gap-2">
              <motion.span className="text-sm" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>📊</motion.span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Comunidad</span>
            </div>
            <div className="space-y-2">
              {[
                { icon: "📝", label: "Total publicaciones", value: posts.length },
                { icon: "📸", label: "Con imagen", value: posts.filter((p) => getPostImages(p).length > 0).length },
                { icon: "🍻", label: "Total saludos", value: posts.reduce((sum, p) => sum + getLikeCount(p), 0) },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(251,191,36,0.04)" }}>
                  <span className="flex items-center gap-2 text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    <span>{stat.icon}</span> {stat.label}
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: "var(--color-amber-primary)", fontVariantNumeric: "tabular-nums" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "filtros":
        return (
          <div className="px-5 py-3">
            <div className="mb-2.5 flex items-center gap-2">
              <motion.span className="text-sm" animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>🎯</motion.span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-amber-primary)" }}>Filtros</span>
            </div>
            {/* Search */}
            <div
              className="mb-2.5 flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ borderColor: "var(--color-border-subtle)" }}
            >
              <span style={{ color: "var(--color-amber-primary)" }}>🔍</span>
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-[12px] outline-none"
                style={{ color: "var(--color-text-primary)" }}
              />
              {filtro && (
                <button onClick={() => setFiltro("")} className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                  ✕
                </button>
              )}
            </div>
            {/* Sort */}
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSort(opt.value)}
                  className="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all"
                  style={{
                    borderColor: sort === opt.value ? "var(--color-amber-primary)" : "var(--color-border-light)",
                    color: sort === opt.value ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                    background: sort === opt.value ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)",
                  }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
      </div>
    );
  }

  const postsFiltrados = posts
    .filter((p) => {
      const q = normalizeText(filtro);
      const title = normalizeText(getPostTitle(p));
      const content = normalizeText(getPostContent(p));
      const author = normalizeText(getPostUser(p)?.username || "");
      const matchesText = !q || title.includes(q) || content.includes(q) || author.includes(q);
      const matchesImage = sort === "imagen" ? !!getPostImages(p)[0] : true;
      return matchesText && matchesImage;
    })
    .sort((a, b) => {
      if (sort === "likes") return getLikeCount(b) - getLikeCount(a);
      return new Date(getPostDate(b)).getTime() - new Date(getPostDate(a)).getTime();
    });

  return (
    <div className="relative flex min-h-screen flex-col" style={{ color: "var(--color-text-primary)" }}>
      <GoldenBackground />
      <Navbar />

      <main className="relative z-[2] mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-12 sm:px-6">
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
            🍺 Lo que está tomando la comunidad
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            El feed de la{" "}
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
              escena craft
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-lg text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Publica lo que estás tomando, da likes, comenta y conecta con quienes viven la cerveza tan en serio como tú.
          </motion.p>

          {/* Search (visible below xl, hidden when filtros widget handles it on xl) */}
          <motion.div variants={fadeUp} custom={3} className="mt-6 w-full max-w-md xl:hidden">
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-2.5"
              style={{ background: "var(--color-surface-card)", borderColor: "var(--color-border-subtle)" }}
            >
              <span style={{ color: "var(--color-amber-primary)" }}>🔍</span>
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar publicaciones…"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "var(--color-text-primary)" }}
              />
              {filtro && (
                <button onClick={() => setFiltro("")} className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ✕
                </button>
              )}
            </div>
          </motion.div>

          {/* Sort chips (visible below xl) */}
          <motion.div variants={fadeUp} custom={4} className="mt-3 flex flex-wrap justify-center gap-2 xl:hidden">
            {SORT_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSort(opt.value)}
                className="rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-sm transition-all"
                style={{
                  borderColor: sort === opt.value ? "var(--color-amber-primary)" : "var(--color-border-light)",
                  color: sort === opt.value ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  background: sort === opt.value ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)",
                }}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>

          {/* CTA */}
          {user && (
            <motion.div variants={fadeUp} custom={5} className="mt-5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalAbierto(true)}
                className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Publicar
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
              <span className="text-3xl">📝</span>
              <p className="mt-2 text-[12px] font-medium" style={{ color: "var(--color-text-muted)" }}>Sin widgets activos</p>
              <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>Toca + Agregar para personalizar</p>
            </motion.div>
          )}
        </div>

        {/* ─── Posts feed (single column) ─── */}
        {postsFiltrados.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
            <motion.span className="text-7xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              📝
            </motion.span>
            <h3 className="mt-6 text-xl font-bold">El feed está esperando tu chela</h3>
            <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nadie ha publicado aún. Sé quien rompe el hielo — la comunidad te lo va a agradecer.
            </p>
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setModalAbierto(true)}
                className="mt-6 rounded-full px-6 py-2.5 text-sm font-bold"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                Publicar ahora 🍺
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-5"
            >
              {postsFiltrados.map((post) => {
                const liked = getLikeUsers(post).includes(getUserId(user));
                return (
                  <PostCard
                    key={getPostId(post)}
                    post={post}
                    liked={liked}
                    onLike={() => toggleLike(getPostId(post))}
                    onClick={() => router.push(`/posts/${getPostId(post)}`)}
                    shareOpenId={shareOpenId}
                    onShareToggle={setShareOpenId}
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
              {postsFiltrados.length} publicación{postsFiltrados.length !== 1 ? "es" : ""}
              {filtro && <> para &ldquo;<strong>{filtro}</strong>&rdquo;</>}
            </motion.p>
          </>
        )}
      </main>

      {/* ─── Fixed Sidebar Widgets (xl only) ─── */}
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
            <div className="flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden flex-1 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(251,191,36,0.2) transparent" }}>
              {/* Header row */}
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

              {/* Drag-to-reorder widget cards */}
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

                      {/* Remove button */}
                      <motion.button
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.88 }}
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
                  <span className="text-3xl">📝</span>
                  <p className="mt-2 text-[12px] font-medium" style={{ color: "var(--color-text-muted)" }}>Sin widgets activos</p>
                </motion.div>
              )}

              {/* Add widget button */}
              {WIDGET_REGISTRY.some((w) => !enabledWidgets.includes(w.id)) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
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
                </motion.button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Widget Picker Card (xl only) ─── */}
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
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleWidget(w.id)}
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

      {/* ─── Mobile Picker Bottom Sheet (xl:hidden) ─── */}
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

      {/* ─── New post modal ─── */}
      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 480,
            bgcolor: "var(--color-brown-modal)",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ color: "var(--color-amber-primary)", fontWeight: 700, mb: 2 }}>
            ✏️ Nueva publicación
          </Typography>
          <TextField
            label="Título"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="¿Qué quieres compartir?"
            fullWidth
            multiline
            rows={3}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            component="label"
            fullWidth
            variant="outlined"
            sx={{
              color: "var(--color-amber-primary)",
              borderColor: "var(--color-amber-primary)",
              "&:hover": { bgcolor: "var(--color-amber-primary)", color: "var(--color-text-dark)" },
            }}
          >
            📷 Subir Imagen
            <input type="file" hidden accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
          </Button>
          {preview && (
            <Box mt={2}>
              <Image src={preview} alt="preview" width={400} height={250} style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "cover" }} />
            </Box>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              background: "var(--gradient-button-primary)",
              color: "var(--color-text-dark)",
              fontWeight: 700,
              "&:hover": { opacity: 0.9 },
            }}
          >
            Publicar 🚀
          </Button>
        </Box>
      </Modal>

      <Footer />
    </div>
  );
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
function getUserId(user?: Usuario | null): string {
  return user?._id || user?.id || "";
}
function getLikeUsers(post?: Post): string[] {
  return post?.reacciones?.meGusta?.usuarios || post?.reactions?.like?.users || [];
}
function getLikeCount(post: Post): number {
  return (
    post.reacciones?.meGusta?.count ?? post.reactions?.like?.count ?? getLikeUsers(post).length ?? 0
  );
}
function getPostDate(post: Post): string {
  return post.createdAt ?? post.updatedAt ?? "";
}
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
