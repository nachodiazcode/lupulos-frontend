"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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

/* ─── Post Card ─── */
function PostCard({
  post,
  liked,
  onLike,
  onClick,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
}) {
  const img = getPostImages(post)[0];
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={cardPop}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-sm transition-all"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Image */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{ background: "var(--color-surface-card-alt)" }}
      >
        {img && !imgError ? (
          <Image
            src={getImageUrl(img)}
            alt={getPostTitle(post)}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl select-none">📝</div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35) 100%)" }}
        />

        {/* Like button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          whileHover={{ scale: 1.25, rotate: 8 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md"
          style={{
            background: liked ? "rgba(251,191,36,0.3)" : "rgba(0,0,0,0.4)",
            boxShadow: liked ? "0 0 12px rgba(251,191,36,0.3)" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={liked ? "liked" : "not"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="text-base leading-none"
            >
              {liked ? "🍻" : "🤍"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="truncate text-lg font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {getPostTitle(post)}
        </h3>

        <p
          className="mt-2 line-clamp-2 text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {getPostContent(post)}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>
            Por <strong style={{ color: "var(--color-text-secondary)" }}>@{getPostUser(post)?.username ?? "—"}</strong>
          </span>
          <span style={{ color: "var(--color-amber-primary)" }}>🍻 {getLikeCount(post)}</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background: "linear-gradient(90deg, var(--color-amber-primary), var(--color-amber-dark), transparent)",
        }}
      />
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

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) setUser(JSON.parse(storedUser));
    fetchPosts();
  }, []);

  useEffect(() => {
    if (imagen) {
      const url = URL.createObjectURL(imagen);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagen]);

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
            Comunidad
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Historias{" "}
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
              cerveceras
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 max-w-lg text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Comparte experiencias, descubrimientos y momentos con la comunidad
          </motion.p>

          {/* Search */}
          <motion.div variants={fadeUp} custom={3} className="mt-6 w-full max-w-md">
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

          {/* Sort chips */}
          <motion.div variants={fadeUp} custom={4} className="mt-3 flex flex-wrap justify-center gap-2">
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

        {/* ─── Posts grid ─── */}
        {postsFiltrados.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
            <motion.span className="text-7xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              📝
            </motion.span>
            <h3 className="mt-6 text-xl font-bold">Aún no hay publicaciones</h3>
            <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--color-text-muted)" }}>
              ¡Sé el primero en compartir tu historia cervecera con la comunidad!
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
                Crear la primera publicación 🚀
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
