"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField, Typography } from "@mui/material";

import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import { SidebarWidget } from "@/components/ui/SidebarWidget";
import PostCard from "@/components/ui/PostCard";
import { api } from "@/lib/api";
import {
  MAX_VIDEO_DURATION_SECONDS,
  extractUploadedMedia,
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
  views?: number;
  comments?: unknown[];
  reacciones?: Record<string, { count?: number; users?: string[]; usuarios?: string[] }>;
  reactions?: Record<string, { count?: number; users?: string[]; usuarios?: string[] }>;
}

type ReactionType = "cheers" | "recommended" | "like";

const SORT_OPTIONS = [
  { label: "🆕 Recientes", value: "recientes" },
  { label: "🔥 Top", value: "likes" },
  { label: "🖼️ Con foto", value: "imagen" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const WIDGET_REGISTRY = [
  {
    id: "publicar",
    emoji: "✏️",
    label: "Publicar",
    description: "Crea una publicacion rapida.",
  },
  {
    id: "tendencias",
    emoji: "🔥",
    label: "Tendencias",
    description: "Lo mas saludado por la comunidad.",
  },
  {
    id: "comunidad-stats",
    emoji: "📊",
    label: "Comunidad",
    description: "Lectura rapida del movimiento.",
  },
  {
    id: "filtros",
    emoji: "🎯",
    label: "Filtros",
    description: "Busca y ordena la actividad.",
  },
] as const;

type WidgetId = (typeof WIDGET_REGISTRY)[number]["id"];

const DEFAULT_WIDGETS: WidgetId[] = ["publicar", "tendencias", "comunidad-stats", "filtros"];
const SIDEBAR_STORAGE_KEY = "posts_sidebar_widgets_v1";

const widgetById = new Map(WIDGET_REGISTRY.map((widget) => [widget.id, widget]));

function isWidgetId(value: string): value is WidgetId {
  return WIDGET_REGISTRY.some((widget) => widget.id === value);
}

export default function PostPage() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [sort, setSort] = useState<SortKey>("recientes");
  const [sidebarDismissed, setSidebarDismissed] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [widgetTitulo, setWidgetTitulo] = useState("");
  const [widgetContenido, setWidgetContenido] = useState("");
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);

    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as Usuario);
      } catch {
        setUser(null);
      }
    }

    const storedWidgets = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedWidgets) {
      try {
        const parsed = JSON.parse(storedWidgets) as string[];
        const validWidgets = parsed.filter(isWidgetId);
        if (validWidgets.length > 0) setEnabledWidgets(validWidgets);
      } catch {
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
      }
    }

    void fetchPosts();
  }, []);

  useEffect(() => {
    if (!imagen) {
      setPreview(null);
      return undefined;
    }

    const url = URL.createObjectURL(imagen);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagen]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/post");
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.posts || [];
      setPosts(data);
    } catch (err) {
      console.error("Error al obtener publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = (user?._id || user?.id || "") as string;

  const SP_REACTION: Record<ReactionType, string> = {
    cheers: "brindis",
    recommended: "recomendado",
    like: "meGusta",
  };

  const getReactionUsers = (post: Post, type: ReactionType): string[] => {
    const en = post.reactions?.[type];
    const sp = post.reacciones?.[SP_REACTION[type]];
    return en?.users || sp?.users || sp?.usuarios || [];
  };

  const handleReact = async (postId: string, type: ReactionType) => {
    if (!postId || !user) return;
    const spKey = SP_REACTION[type];
    // Optimista: actualiza el contador al instante
    setPosts((prev) =>
      prev.map((post) => {
        if (getPostId(post) !== postId) return post;
        const users = getReactionUsers(post, type);
        const has = users.includes(currentUserId);
        const nextUsers = has ? users.filter((u) => u !== currentUserId) : [...users, currentUserId];
        const shape = { count: nextUsers.length, users: nextUsers, usuarios: nextUsers };
        return {
          ...post,
          reactions: { ...post.reactions, [type]: shape },
          reacciones: { ...post.reacciones, [spKey]: shape },
        };
      })
    );
    try {
      await api.post(`/post/${postId}/react`, { type });
    } catch (error) {
      console.error("Error al reaccionar al post:", error);
      void fetchPosts();
    }
  };

  const handleMediaSelected = async (file: File | null) => {
    if (!file) return;

    setMediaError("");

    if (file.type.startsWith("video/")) {
      try {
        const durationSeconds = await readVideoDurationSeconds(file);
        if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
          setMediaError("Los videos del muro pueden durar hasta 12 minutos.");
          return;
        }
      } catch (error) {
        console.error("Error al leer duracion del video:", error);
        setMediaError("No pudimos leer la duracion de ese video.");
        return;
      }
    }

    setImagen(file);
  };

  const resetComposer = () => {
    setTitulo("");
    setContenido("");
    setImagen(null);
    setPreview(null);
    setMediaError("");
  };

  const handleSubmit = async () => {
    const userId = getUserId(user);
    if (!userId) return;

    try {
      let uploadedMedia: PostMedia | null = null;
      let imagePath = "";

      if (imagen) {
        const formData = new FormData();
        formData.append("media", imagen);

        if (imagen.type.startsWith("video/")) {
          const durationSeconds = await readVideoDurationSeconds(imagen);
          formData.append("durationSeconds", String(durationSeconds));
        }

        const res = await api.post("/post/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedMedia = extractUploadedMedia(res.data);
        imagePath = uploadedMedia?.path || "";

        if (!imagePath) {
          throw new Error("Upload response did not include a media path");
        }
      }

      await api.post("/post", {
        titulo,
        contenido,
        media: uploadedMedia ? [uploadedMedia] : [],
        imagenes: imagePath ? [imagePath] : [],
      });

      resetComposer();
      setModalAbierto(false);
      await fetchPosts();
    } catch (err) {
      console.error("Error al subir publicacion:", err);
      setMediaError("No pudimos subir la publicacion.");
    }
  };

  const handleWidgetSubmit = async () => {
    const userId = getUserId(user);
    if (!userId || !widgetTitulo.trim()) return;

    try {
      await api.post("/post", {
        titulo: widgetTitulo,
        contenido: widgetContenido,
        imagenes: [],
        media: [],
      });
      setWidgetTitulo("");
      setWidgetContenido("");
      await fetchPosts();
    } catch (err) {
      console.error("Error al subir publicacion:", err);
    }
  };

  const toggleWidget = (id: WidgetId) => {
    setEnabledWidgets((prev) => {
      const next = prev.includes(id) ? prev.filter((widgetId) => widgetId !== id) : [...prev, id];
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
      if (next.length === WIDGET_REGISTRY.length) setPickerOpen(false);
      return next;
    });
  };

  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
      </div>
    );
  }

  const postsFiltrados = posts
    .filter((post) => {
      const query = normalizeText(filtro);
      const title = normalizeText(getPostTitle(post));
      const content = normalizeText(getPostContent(post));
      const author = normalizeText(getPostUser(post)?.username || "");
      const matchesText = !query || title.includes(query) || content.includes(query) || author.includes(query);
      const matchesImage = sort === "imagen" ? getPostImages(post).length > 0 || getPostMedia(post).length > 0 : true;
      return matchesText && matchesImage;
    })
    .sort((a, b) => {
      if (sort === "likes") return getLikeCount(b) - getLikeCount(a);
      return new Date(getPostDate(b)).getTime() - new Date(getPostDate(a)).getTime();
    });

  const topPosts = [...posts].sort((a, b) => getLikeCount(b) - getLikeCount(a)).slice(0, 5);
  const totalCheers = posts.reduce((sum, post) => sum + getLikeCount(post), 0);
  const postsWithMedia = posts.filter((post) => getPostImages(post).length > 0 || getPostMedia(post).length > 0).length;
  const hiddenFeedSummary = `${postsFiltrados.length} publicacion${postsFiltrados.length === 1 ? "" : "es"} filtrada${
    postsFiltrados.length === 1 ? "" : "s"
  }`;

  const renderWidget = (id: WidgetId): React.ReactNode => {
    switch (id) {
      case "publicar":
        return (
          <div className="space-y-3">
            {user ? (
              <>
                <input
                  type="text"
                  value={widgetTitulo}
                  onChange={(event) => setWidgetTitulo(event.target.value)}
                  placeholder="Titulo..."
                  className="w-full rounded-2xl border bg-transparent px-3 py-2 text-[12px] font-semibold outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <textarea
                  value={widgetContenido}
                  onChange={(event) => setWidgetContenido(event.target.value)}
                  placeholder="Que estas tomando?"
                  rows={3}
                  className="w-full resize-none rounded-2xl border bg-transparent px-3 py-2 text-[12px] outline-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleWidgetSubmit}
                  disabled={!widgetTitulo.trim()}
                  className="w-full rounded-full px-4 py-2 text-[12px] font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  Publicar
                </button>
              </>
            ) : (
              <p className="text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                Inicia sesion para publicar en la comunidad.
              </p>
            )}
          </div>
        );

      case "tendencias":
        return (
          <div className="space-y-2">
            {topPosts.length > 0 ? (
              topPosts.map((post, index) => {
                const postId = getPostId(post);
                return (
                  <button
                    key={postId || `${getPostTitle(post)}-${index}`}
                    type="button"
                    onClick={() => {
                      if (postId) window.location.href = `/posts/${postId}`;
                    }}
                    className="flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition-all hover:translate-x-0.5"
                    style={{
                      borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <span className="text-[10px] font-black text-[var(--color-amber-primary)]">#{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-[var(--color-text-primary)]">
                      {getPostTitle(post) || "Sin titulo"}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                      🍻 {getLikeCount(post)}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                Aun no hay actividad para destacar.
              </p>
            )}
          </div>
        );

      case "comunidad-stats":
        return (
          <div className="grid gap-2">
            {[
              { icon: "📝", label: "Publicaciones", value: posts.length },
              { icon: "📸", label: "Con media", value: postsWithMedia },
              { icon: "🍻", label: "Saludos", value: totalCheers },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border px-3 py-2.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--color-text-secondary)]">
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
                <span className="text-[13px] font-black tabular-nums text-[var(--color-amber-primary)]">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        );

      case "filtros":
        return (
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 rounded-2xl border px-3 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 68%, transparent)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span className="text-[var(--color-amber-primary)]">🔎</span>
              <input
                type="text"
                value={filtro}
                onChange={(event) => setFiltro(event.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-[12px] font-semibold outline-none"
                style={{ color: "var(--color-text-primary)" }}
              />
              {filtro ? (
                <button
                  type="button"
                  onClick={() => setFiltro("")}
                  className="text-[11px] font-bold text-[var(--color-text-muted)]"
                  aria-label="Limpiar busqueda"
                >
                  ×
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((option) => {
                const active = sort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSort(option.value)}
                    className="rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition-all"
                    style={{
                      borderColor: active
                        ? "var(--color-amber-primary)"
                        : "color-mix(in srgb, var(--color-border-light) 62%, transparent)",
                      background: active ? "rgba(251,191,36,0.13)" : "rgba(255,255,255,0.03)",
                      color: active ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const widgetPicker = (
    <AnimatePresence initial={false}>
      {pickerOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="rounded-[1.25rem] border p-3"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border-amber) 46%, var(--color-border-light))",
            background: "color-mix(in srgb, var(--color-surface-card) 94%, transparent)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-amber-primary)]">
              Disponibles
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full border text-[12px]"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
                color: "var(--color-text-muted)",
              }}
              aria-label="Cerrar selector"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {WIDGET_REGISTRY.filter((widget) => !enabledWidgets.includes(widget.id)).map((widget) => (
              <div
                key={widget.id}
                className="flex items-center gap-3 rounded-2xl border p-3"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 62%, transparent)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <span className="text-lg">{widget.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-extrabold text-[var(--color-text-primary)]">
                    {widget.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-[var(--color-text-muted)]">
                    {widget.description}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleWidget(widget.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[16px] font-black"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                  aria-label={`Agregar ${widget.label}`}
                >
                  +
                </button>
              </div>
            ))}
            {WIDGET_REGISTRY.every((widget) => enabledWidgets.includes(widget.id)) ? (
              <p className="py-3 text-center text-[12px] font-semibold text-[var(--color-text-muted)]">
                Todos los widgets estan activos.
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const widgetRail = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          Mis widgets
        </p>
        <button
          type="button"
          onClick={() => setSidebarDismissed(true)}
          className="flex h-7 w-7 items-center justify-center rounded-full border text-[13px]"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border-light) 65%, transparent)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--color-text-muted)",
          }}
          aria-label="Ocultar widgets"
        >
          ×
        </button>
      </div>

      <Reorder.Group
        axis="y"
        values={enabledWidgets}
        onReorder={(newOrder) => {
          setEnabledWidgets(newOrder);
          localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newOrder));
        }}
        className="space-y-3"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {enabledWidgets.map((id) => {
            const widget = widgetById.get(id);
            if (!widget) return null;

            return (
              <Reorder.Item key={id} value={id} className="list-none cursor-grab active:cursor-grabbing">
                <SidebarWidget label={widget.label} onClose={() => toggleWidget(id)}>
                  {renderWidget(id)}
                </SidebarWidget>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {enabledWidgets.length === 0 ? (
        <div
          className="rounded-[1.25rem] border border-dashed px-4 py-8 text-center"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border-light) 58%, transparent)",
            color: "var(--color-text-muted)",
          }}
        >
          <p className="text-[12px] font-bold">Sin widgets activos</p>
        </div>
      ) : null}

      {WIDGET_REGISTRY.some((widget) => !enabledWidgets.includes(widget.id)) ? (
        <button
          type="button"
          onClick={() => setPickerOpen((current) => !current)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-[12px] font-extrabold transition-all"
          style={{
            borderColor: pickerOpen
              ? "var(--color-amber-primary)"
              : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
            background: pickerOpen ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
            color: pickerOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
          }}
        >
          <span className="text-base leading-none">{pickerOpen ? "−" : "+"}</span>
          Agregar widget
        </button>
      ) : null}

      {widgetPicker}
    </div>
  );

  return (
    <MainLayout
      maxWidth="calc(1140px + 4rem)"
      stickySidebar={false}
      title="Bienvenido a la Comunidad"
      titleGradientText="Lupuloso"
      titleGradient="var(--gradient-heading)"
      subtitle="Tu super comunidad cervecera: brinda, recomienda, comenta y descubre lo que está pasando 🍻"
      sidebar={!sidebarDismissed ? widgetRail : undefined}
    >
      <div className="relative z-[2] mx-auto w-full flex-1 pb-12">
        {sidebarDismissed ? (
          <button
            type="button"
            onClick={() => setSidebarDismissed(false)}
            className="mb-4 rounded-full border px-4 py-2 text-[12px] font-extrabold transition-all hover:translate-y-[-1px]"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-amber) 60%, transparent)",
              background: "rgba(251,191,36,0.06)",
              color: "var(--color-amber-primary)",
            }}
          >
            Mostrar widgets
          </button>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-[1.5rem] border p-4"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 84%, transparent))",
            borderColor: "color-mix(in srgb, var(--color-border-light) 70%, transparent)",
            boxShadow: "var(--shadow-card)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
          }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl border px-3.5 py-3"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border-light) 62%, transparent)",
              background: "rgba(255,255,255,0.035)",
            }}
          >
            <span className="text-[var(--color-amber-primary)]">🔎</span>
            <input
              type="text"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              placeholder="Buscar actividad de la comunidad..."
              className="w-full bg-transparent text-sm font-semibold outline-none"
              style={{ color: "var(--color-text-primary)" }}
            />
            {filtro ? (
              <button
                type="button"
                onClick={() => setFiltro("")}
                className="text-sm font-black text-[var(--color-text-muted)]"
                aria-label="Limpiar busqueda"
              >
                ×
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((option) => {
              const active = sort === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-all"
                  style={{
                    borderColor: active
                      ? "var(--color-amber-primary)"
                      : "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                    background: active ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                    color: active ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
            <span className="ml-auto text-[11px] font-bold text-[var(--color-text-muted)]">
              {hiddenFeedSummary}
            </span>
          </div>
        </motion.section>

        {/* ─── Feed de la comunidad ─── */}
        <div className="mt-5">
          {postsFiltrados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative overflow-hidden rounded-[1.75rem] border p-10 text-center md:p-14"
              style={{
                background: "linear-gradient(180deg, rgba(251,191,36,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                boxShadow: "var(--shadow-card)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/5 blur-[80px]" />
              <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {filtro ? "🔍" : "💬"}
              </span>
              <h3 className="text-2xl font-extrabold leading-tight text-[var(--color-text-primary)]">
                {filtro ? "Sin resultados para tu búsqueda" : "Sé el primero en publicar"}
              </h3>
              <p className="mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {filtro
                  ? "Prueba con otra palabra o limpia el filtro para ver toda la actividad."
                  : "Comparte una cata, una salida o esa cerveza que te voló la cabeza y arranca la conversación."}
              </p>
              <motion.button
                whileHover={{ scale: 1.03, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => (filtro ? setFiltro("") : setModalAbierto(true))}
                className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold"
                style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
              >
                <span>{filtro ? "Limpiar búsqueda" : "Crear publicación"}</span>
                <span>→</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="flex flex-col gap-4"
            >
              {postsFiltrados.map((post) => {
                const postId = getPostId(post);
                return (
                  <PostCard
                    key={postId}
                    post={post}
                    myReactions={{
                      cheers: getReactionUsers(post, "cheers").includes(currentUserId),
                      recommended: getReactionUsers(post, "recommended").includes(currentUserId),
                      like: getReactionUsers(post, "like").includes(currentUserId),
                    }}
                    onReact={(type) => handleReact(postId, type)}
                    onClick={() => {
                      if (postId) window.location.href = `/posts/${postId}`;
                    }}
                    shareOpenId={shareOpenId}
                    onShareToggle={setShareOpenId}
                    currentUser={user}
                  />
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="mt-5 space-y-3 xl:hidden">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Mis widgets
            </p>
            {WIDGET_REGISTRY.some((widget) => !enabledWidgets.includes(widget.id)) ? (
              <button
                type="button"
                onClick={() => setPickerOpen((current) => !current)}
                className="rounded-full border px-3 py-1.5 text-[11px] font-extrabold"
                style={{
                  borderColor: pickerOpen
                    ? "var(--color-amber-primary)"
                    : "color-mix(in srgb, var(--color-border-amber) 55%, transparent)",
                  background: pickerOpen ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                  color: pickerOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                }}
              >
                {pickerOpen ? "Cerrar" : "+ Agregar"}
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {enabledWidgets.map((id) => {
              const widget = widgetById.get(id);
              if (!widget) return null;
              return (
                <SidebarWidget key={id} label={widget.label} onClose={() => toggleWidget(id)}>
                  {renderWidget(id)}
                </SidebarWidget>
              );
            })}
          </AnimatePresence>

          {widgetPicker}
        </div>
      </div>

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
          <Typography variant="h6" sx={{ color: "var(--color-amber-primary)", fontWeight: 800, mb: 2 }}>
            Nueva publicacion
          </Typography>
          <TextField
            label="Titulo"
            fullWidth
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Que quieres compartir?"
            fullWidth
            multiline
            rows={3}
            value={contenido}
            onChange={(event) => setContenido(event.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            component="label"
            fullWidth
            variant="outlined"
            sx={{
              color: "var(--color-amber-primary)",
              borderColor: "var(--color-amber-primary)",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "var(--color-amber-primary)",
                color: "var(--color-text-dark)",
              },
            }}
          >
            Subir foto o video
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={(event) => void handleMediaSelected(event.target.files?.[0] || null)}
            />
          </Button>
          {mediaError ? (
            <Typography sx={{ mt: 1.5, color: "var(--color-amber-primary)", fontSize: "0.92rem" }}>
              {mediaError}
            </Typography>
          ) : null}
          {preview ? (
            <Box mt={2}>
              {imagen?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: 320, objectFit: "cover" }}
                />
              ) : (
                <Image
                  src={preview}
                  alt="Vista previa"
                  width={400}
                  height={250}
                  style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "cover" }}
                />
              )}
            </Box>
          ) : null}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              background: "var(--gradient-button-primary)",
              color: "var(--color-text-dark)",
              fontWeight: 800,
              "&:hover": { opacity: 0.9 },
            }}
          >
            Publicar
          </Button>
        </Box>
      </Modal>

      <Footer />
    </MainLayout>
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

function getPostMedia(post: Post): PostMedia[] {
  return post.media || post.multimedia || [];
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
  return post.reacciones?.meGusta?.count ?? post.reactions?.like?.count ?? getLikeUsers(post).length ?? 0;
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
