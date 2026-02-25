"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import { Rating, Snackbar, Alert, Avatar } from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Beer, User } from "@/types";

/* ─── Helpers ─── */
const getUserId = (u?: Pick<User, "_id" | "id"> | null) => u?._id ?? u?.id ?? "";
const getAvatarPath = (u?: Pick<User, "fotoPerfil" | "photo" | "profilePicture"> | null) => {
  const p = u?.fotoPerfil || u?.photo || u?.profilePicture || "";
  return p.startsWith("./") ? p.replace("./", "/") : p;
};

const RATING_LABELS: Record<number, string> = {
  1: "😐 Regular",
  2: "🍺 Aceptable",
  3: "🍻 Buena",
  4: "🔥 Muy buena",
  5: "🤩 Excelente",
};

/* ─── Delete confirmation modal ─── */
function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 p-7 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(45,26,14,0.95) 0%, rgba(20,12,8,0.98) 100%)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 60px rgba(239,68,68,0.06)",
        }}
      >
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl">
          🗑️
        </div>
        <h3 className="mt-3 text-lg font-bold text-white">Eliminar cerveza</h3>
        <p className="mt-1 text-sm text-white/50">
          Esta acción es irreversible. ¿Estás seguro de que quieres eliminar esta cerveza?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600"
            style={{ boxShadow: "0 0 20px rgba(239,68,68,0.3)" }}
          >
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DetalleCervezaPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [beer, setBeer] = useState<Beer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; color: string }>({
    open: false,
    message: "",
    color: "#6EE7B7",
  });

  const showToast = (message: string, color: string) => setSnackbar({ open: true, message, color });

  const fetchBeer = useCallback(async () => {
    try {
      const res = await api.get(`/beer/${id}`);
      setBeer(res.data?.data ?? null);
    } catch {
      setBeer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    if (id) fetchBeer();
  }, [id, fetchBeer]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      setCommentError("Escribe un comentario antes de publicar");
      return;
    }
    setCommentError("");
    setSubmitting(true);
    try {
      await api.post(`/beer/${id}/review`, { comment: comment.trim(), rating });
      setComment("");
      setRating(4);
      showToast("Comentario publicado 💬", "var(--color-emerald)");
      fetchBeer();
    } catch {
      showToast("Error al publicar el comentario", "var(--color-error)");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBeer = async () => {
    setShowDeleteModal(false);
    try {
      await api.delete(`/beer/${id}`);
      showToast("Cerveza eliminada 🍺", "var(--color-amber-primary)");
      setTimeout(() => router.push("/cervezas"), 1800);
    } catch {
      showToast("Error al eliminar la cerveza", "var(--color-error)");
    }
  };

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-16 w-16 animate-pulse rounded-2xl"
              style={{ background: "var(--color-surface-card)" }}
            />
            <div
              className="h-3 w-40 animate-pulse rounded"
              style={{ background: "var(--color-surface-card)" }}
            />
            <div
              className="h-2 w-28 animate-pulse rounded"
              style={{ background: "var(--color-surface-card)" }}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (!beer) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <div>
            <p className="text-5xl">😢</p>
            <h2 className="mt-4 text-xl font-bold text-white">Cerveza no encontrada</h2>
            <p className="mt-2 text-sm text-white/40">
              El ID no corresponde a ninguna cerveza registrada.
            </p>
            <button
              onClick={() => router.push("/cervezas")}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{ background: "var(--gradient-button-primary)" }}
            >
              Volver al listado
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && beer.createdBy && getUserId(beer.createdBy) === getUserId(user);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden pt-16 pb-0"
        style={{ background: "var(--gradient-section-dark)" }}
      >
        {/* Ambient glow behind bottle */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, var(--color-amber-primary), transparent 70%)`,
          }}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 md:flex-row md:items-end md:gap-12">
          {/* Bottle image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex w-full max-w-[220px] shrink-0 justify-center"
          >
            {beer.image ? (
              <Image
                src={getImageUrl(beer.image)}
                alt={beer.name}
                width={400}
                height={500}
                priority
                unoptimized
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
                }}
              />
            ) : (
              <div
                className="flex h-48 w-32 items-center justify-center rounded-2xl text-4xl"
                style={{ background: "var(--color-surface-card)" }}
              >
                🍺
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 pb-10"
          >
            {/* Badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
                style={{
                  background: "var(--color-border-amber)",
                  color: "var(--color-amber-primary)",
                }}
              >
                {beer.style}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(251,191,36,0.1)", color: "var(--color-amber-primary)" }}
              >
                {beer.abv}% ABV
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {beer.name}
            </h1>
            <p className="mt-1 text-base text-white/50">{beer.brewery}</p>

            {/* Average rating */}
            <div className="mt-4 flex items-center gap-3">
              <Rating value={beer.averageRating ?? 0} precision={0.5} readOnly size="medium" />
              <span
                className="text-2xl font-extrabold"
                style={{ color: "var(--color-amber-primary)" }}
              >
                {(beer.averageRating ?? 0).toFixed(1)}
              </span>
              <span className="text-sm text-white/30">
                / 5 · {beer.reviews?.length ?? 0} reseña
                {(beer.reviews?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/60">
              {beer.description}
            </p>

            {/* Uploader */}
            <p className="mt-3 text-xs text-white/30">
              Subido por{" "}
              <span className="font-semibold text-white/50">
                {beer.createdBy?.username || "usuario desconocido"}
              </span>
            </p>

            {/* Owner actions */}
            {isOwner && (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => router.push(`/cervezas/editar/${beer._id}`)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-medium text-red-400/80 transition-all hover:bg-red-400/10 hover:text-red-400"
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="relative mt-8 h-8 overflow-hidden">
          <svg
            viewBox="0 0 1440 32"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
            style={{ height: 32 }}
          >
            <path
              d="M0,16 C360,32 1080,0 1440,16 L1440,32 L0,32 Z"
              fill="var(--color-surface-deepest)"
            />
          </svg>
        </div>
      </section>

      {/* ─── Main content ─── */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left — Reviews list */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-white">Reseñas de la comunidad</h2>

            {!beer.reviews?.length ? (
              <div
                className="rounded-2xl border border-white/5 p-8 text-center"
                style={{ background: "var(--gradient-card-glass)" }}
              >
                <p className="text-3xl">🍺</p>
                <p className="mt-2 text-sm text-white/40">Sin reseñas todavía. ¡Sé el primero!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {beer.reviews.map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-white/5 p-5"
                    style={{ background: "var(--gradient-card-glass)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={getImageUrl(getAvatarPath(review.user))}
                        sx={{ width: 36, height: 36 }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {getUserId(review.user) === getUserId(user)
                            ? "Tú"
                            : review.user?.username || "Anónimo"}
                        </p>
                        <Rating value={review.rating} readOnly size="small" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Review form */}
          <div>
            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-20 rounded-2xl border border-white/5 p-6"
                style={{ background: "var(--gradient-card-glass)" }}
              >
                <h3 className="mb-4 text-base font-bold text-white">Tu opinión 🍻</h3>

                {/* Star picker */}
                <div className="mb-1">
                  <p className="mb-1.5 text-xs font-medium tracking-wide text-white/40 uppercase">
                    Calificación
                  </p>
                  <Rating
                    value={rating}
                    onChange={(_, v) => setRating(v ?? 1)}
                    size="large"
                    precision={1}
                  />
                  {rating > 0 && (
                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{ color: "var(--color-amber-primary)" }}
                    >
                      {RATING_LABELS[rating]}
                    </p>
                  )}
                </div>

                {/* Comment textarea */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium tracking-wide text-white/40 uppercase">
                    Comentario
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      setCommentError("");
                    }}
                    placeholder="Escribe tu opinión sobre esta cerveza..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 transition-all focus:border-amber-400/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/15 focus:outline-none"
                  />
                  {commentError && <p className="mt-1 text-xs text-red-400/80">{commentError}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCommentSubmit}
                  disabled={submitting}
                  className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "var(--gradient-button-primary)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          fill="currentColor"
                          className="opacity-75"
                        />
                      </svg>
                      Publicando...
                    </span>
                  ) : (
                    "Publicar reseña 🍺"
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <div
                className="rounded-2xl border border-white/5 p-6 text-center"
                style={{ background: "var(--gradient-card-glass)" }}
              >
                <p className="text-sm text-white/40">Inicia sesión para dejar tu reseña</p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="mt-3 rounded-xl px-5 py-2 text-sm font-semibold text-black"
                  style={{ background: "var(--gradient-button-primary)" }}
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal onConfirm={handleDeleteBeer} onCancel={() => setShowDeleteModal(false)} />
        )}
      </AnimatePresence>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{
            backgroundColor: snackbar.color,
            color: "#000",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
