"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import {
  Snackbar,
  Alert,
  Container,
  Typography,
  Box,
  Stack,
  Paper,
  TextField,
  Button,
  Rating,
  Avatar,
} from "@mui/material";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Usuario {
  _id?: string;
  id?: string;
  username?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
}

interface Review {
  _id: string;
  user?: Usuario;
  comment: string;
  rating: number;
  createdAt?: string;
}

interface Place {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  reviews: Review[];
}

export default function LugarDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [lugar, setLugar] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [rating, setRating] = useState<number | null>(0);
  const [user, setUser] = useState<Usuario | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");

  const fetchLugar = useCallback(async () => {
    try {
      const res = await api.get(`/location/${id}`);
      setLugar(res.data.data);
    } catch (error) {
      console.error("❌ Error al obtener lugar:", error);
      setSnackbarMessage("Error al cargar lugar");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchLugar();
  }, [fetchLugar]);

  const handleCommentSubmit = async () => {
    if (!comentario.trim()) return;
    try {
      await api.post(`/location/${id}/reviews`, {
        comment: comentario,
        rating: rating || 5,
      });
      setComentario("");
      setRating(0);
      setSnackbarMessage("Comentario publicado 🍻");
      setSnackbarColor("#38bdf8");
      setSnackbarOpen(true);
      fetchLugar();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const handleDeleteLugar = async () => {
    if (!window.confirm("¿Eliminar este lugar?")) return;
    try {
      await api.delete(`/location/${id}`);
      setSnackbarMessage("Lugar eliminado ❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      setTimeout(() => router.push("/lugares"), 2000);
    } catch (error) {
      console.error("❌ Error al eliminar lugar:", error);
    }
  };

  if (loading || !lugar) {
    return <div className="p-10 text-white">Cargando lugar...</div>;
  }
  const getUserId = (u?: Usuario | null) => u?._id ?? u?.id ?? "";
  const getUserAvatar = (u?: Usuario | null) => {
    const path = u?.fotoPerfil || u?.photo || u?.profilePicture || "";
    return path.startsWith("./") ? path.replace("./", "/") : path;
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0f172a" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={6} alignItems="flex-start">
          <Box flexShrink={0}>
            {lugar.coverImage && (
              <Image
                src={getImageUrl(lugar.coverImage)}
                alt={lugar.name}
                width={400}
                height={400}
                unoptimized
                className="rounded-lg object-cover shadow-xl"
                priority
              />
            )}
          </Box>

          <Box flex={1}>
            <Typography variant="h3" fontWeight="bold" textTransform="capitalize">
              {lugar.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: "#94a3b8" }}>
              {lugar.address.street}, {lugar.address.city}, {lugar.address.country}
            </Typography>
            <Typography variant="body1" sx={{ mt: 3, color: "#e2e8f0" }}>
              {lugar.description}
            </Typography>

            {user && (
              <Stack direction="row" spacing={2} mt={4}>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => router.push(`/lugares/editar/${lugar._id}`)}
                >
                  Editar Lugar ✏️
                </Button>
                <Button variant="outlined" color="error" onClick={handleDeleteLugar}>
                  Eliminar Lugar 🗑️
                </Button>
              </Stack>
            )}

            {user && (
              <Paper
                sx={{ mt: 6, p: 4, bgcolor: "var(--color-surface-elevated)", borderRadius: 3 }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Tu opinión 🍻
                </Typography>
                <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  sx={{
                    mt: 2,
                    bgcolor: "var(--color-surface-card-alt)",
                    borderRadius: 2,
                    textarea: { color: "white" },
                  }}
                />
                <Button
                  onClick={handleCommentSubmit}
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    bgcolor: "var(--color-amber-hover)",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "var(--color-amber-primary)" },
                  }}
                >
                  Comentar 💬
                </Button>
              </Paper>
            )}
          </Box>
        </Stack>

        <Box mt={8}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Comentarios
          </Typography>
          {lugar.reviews?.length ? (
            lugar.reviews.map((c) => (
              <Paper
                key={c._id}
                sx={{ p: 3, mb: 2, bgcolor: "var(--color-surface-card)", borderRadius: 3 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={getImageUrl(getUserAvatar(c.user))} />
                  <Box>
                    <Typography fontWeight="bold">
                      {getUserId(c.user) === getUserId(user) ? "Tú" : c.user?.username || "Anónimo"}
                    </Typography>
                    <Typography fontSize={12} color="gray">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{c.comment}</Typography>
                    <Rating value={c.rating} readOnly size="small" />
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Typography color="gray">Sé el primero en comentar este lugar 🍺</Typography>
          )}
        </Box>
      </Container>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="info" sx={{ backgroundColor: snackbarColor, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </div>
  );
}
