"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Rating,
  Slide,
} from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlaceFormModal from "@/components/LugarFormModal";
import GoldenBackground from "@/components/GoldenBackground";
const amarillo = "var(--color-amber-primary)";

interface Review {
  comment: string;
  rating: number;
  user?: { username: string };
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
  reviews?: Review[];
  likes?: string[];
}

export default function LugaresPage() {
  const [lugares, setLugares] = useState<Place[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoCerveza, setTipoCerveza] = useState("");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [usuario, setUsuario] = useState<{ _id: string; username: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritos(favs);

    const user = localStorage.getItem("user");
    if (user) setUsuario(JSON.parse(user));

    fetchLugares();
  }, []);

  const fetchLugares = async () => {
    try {
      const res = await api.get(`/location`);
      const lugaresData = Array.isArray(res.data.data) ? res.data.data : [];
      setLugares(lugaresData.reverse());
    } catch (error) {
      console.error("❌ Error al obtener lugares:", error);
      setLugares([]);
    }
  };

  const toggleFavorito = (id: string) => {
    const nuevosFavoritos = favoritos.includes(id)
      ? favoritos.filter((fid) => fid !== id)
      : [...favoritos, id];
    setFavoritos(nuevosFavoritos);
    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
  };

  const handleCommentSubmit = async (lugarId: string) => {
    if (!usuario) {
      setSnackbarMessage("Debes iniciar sesión para comentar");
      setSnackbarOpen(true);
      return;
    }

    if (!newComments[lugarId]?.trim()) return;

    try {
      await api.post(
        `/location/${lugarId}/reviews`,
        {
          comment: newComments[lugarId],
          rating: 5,
        },
        {},
      );

      setSnackbarMessage("Comentario publicado 💬");
      setSnackbarOpen(true);
      setNewComments((prev) => ({ ...prev, [lugarId]: "" }));
      fetchLugares();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
      setSnackbarMessage("Error al publicar comentario");
      setSnackbarOpen(true);
    }
  };

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const lugaresFiltrados = lugares.filter((lugar) => {
    const matchBusqueda =
      lugar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lugar.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoCerveza
      ? lugar.description.toLowerCase().includes(tipoCerveza.toLowerCase())
      : true;
    return matchBusqueda && matchTipo;
  });

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GoldenBackground />
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{ px: 2, mt: 4, mb: 6, flex: 1, position: "relative", zIndex: 2 }}
      >
        <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Typography variant="h5">📍 Buscar lugares cerveceros</Typography>
            <Button
              variant="contained"
              onClick={() => setModalOpen(true)}
              sx={{
                bgcolor: "var(--color-amber-primary)",
                color: "black",
                "&:hover": { bgcolor: "var(--color-amber-hover)" },
              }}
            >
              + Agregar Lugar
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={4}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="🔍 Nombre o ciudad"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ borderRadius: 2 }}
            />

            <TextField
              variant="outlined"
              fullWidth
              placeholder="🍺 Tipo de cerveza (opcional)"
              value={tipoCerveza}
              onChange={(e) => setTipoCerveza(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        </Box>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lugaresFiltrados.map((lugar) => {
            const isFavorito = favoritos.includes(lugar._id);
            const calificacionPromedio = lugar.reviews?.length
              ? lugar.reviews.reduce((acc, c) => acc + c.rating, 0) / lugar.reviews.length
              : 0;

            return (
              <div
                key={lugar._id}
                onClick={() => (window.location.href = `/lugares/${lugar._id}`)}
                className="bg-surface-card cursor-pointer space-y-3 rounded-2xl p-4 text-white shadow-md transition-transform hover:-translate-y-2 hover:shadow-lg"
              >
                {lugar.coverImage && (
                  <div className="relative h-64 w-full overflow-hidden rounded">
                    <Image
                      src={getImageUrl(lugar.coverImage)}
                      alt={lugar.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="w-4/5 truncate text-lg font-semibold">{lugar.name}</h2>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(lugar._id);
                    }}
                    sx={{ color: isFavorito ? amarillo : "white" }}
                  >
                    {isFavorito ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </div>

                <p className="text-sm text-gray-400">
                  {lugar.address.city}, {lugar.address.country}
                </p>
                <Rating value={calificacionPromedio} precision={0.5} readOnly size="small" />
                <p className="text-xs text-yellow-400">{calificacionPromedio.toFixed(1)} / 5</p>
                <p className="text-sm text-amber-300">
                  💛 {favoritos.filter((f) => f === lugar._id).length} saludos vikingos
                </p>

                <TextField
                  variant="outlined"
                  placeholder="Escribe un comentario..."
                  value={newComments[lugar._id] || ""}
                  onChange={(e) =>
                    setNewComments((prev) => ({ ...prev, [lugar._id]: e.target.value }))
                  }
                  sx={{
                    bgcolor: "var(--color-surface-card-alt)",
                    borderRadius: 2,
                    width: "100%",
                    input: { color: "white" },
                  }}
                />

                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommentSubmit(lugar._id);
                  }}
                  sx={{
                    mt: 2,
                    bgcolor: "var(--color-amber-primary)",
                    color: "black",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "var(--color-amber-hover)" },
                  }}
                >
                  Comentar 💬
                </Button>
              </div>
            );
          })}
        </div>
      </Container>

      <Footer />

      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        TransitionComponent={slideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert severity="success" sx={{ bgcolor: amarillo, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <PlaceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchLugares();
        }}
        user={usuario}
      />
    </Box>
  );
}
