"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Container, Stack, Typography, TextField, Button, Snackbar,
  Alert, IconButton, Rating, Slide
} from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LugarFormModal from "@/components/LugarFormModal";
import GoldenBackground from '@/components/GoldenBackground';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";
const amarillo = "#fbbf24";

interface Comentario {
  comentario: string;
  puntuacion: number;
  usuario?: { username: string };
}

interface Lugar {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen?: string;
  direccion: {
    calle: string;
    ciudad: string;
    pais: string;
  };
  comentarios?: Comentario[];
  likes?: string[];
}

export default function LugaresPage() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
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
      const res = await axios.get(`${API_URL}/api/location`);
      const lugaresData = Array.isArray(res.data.data) ? res.data.data : [];
      setLugares(lugaresData.reverse());
    } catch (error) {
      console.error("❌ Error al obtener lugares:", error);
      setLugares([]);
    }
  };

  const toggleFavorito = (id: string) => {
    const nuevosFavoritos = favoritos.includes(id)
      ? favoritos.filter(fid => fid !== id)
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
      await axios.post(`${API_URL}/api/location/${lugarId}/review`, {
        comentario: newComments[lugarId],
        puntuacion: 5,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setSnackbarMessage("Comentario publicado 💬");
      setSnackbarOpen(true);
      setNewComments(prev => ({ ...prev, [lugarId]: "" }));
      fetchLugares();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
      setSnackbarMessage("Error al publicar comentario");
      setSnackbarOpen(true);
    }
  };

  const slideTransition = (props: SlideProps) => (
    <Slide {...props} direction="down" />
  );

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const lugaresFiltrados = lugares.filter(lugar => {
    const matchBusqueda = lugar.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lugar.direccion?.ciudad?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoCerveza ? lugar.descripcion.toLowerCase().includes(tipoCerveza.toLowerCase()) : true;
    return matchBusqueda && matchTipo;
  });

  if (!mounted) return null;

  return (
    <Box sx={{
      minHeight: "100vh",
      position: "relative",
      color: "white",
      display: "flex",
      flexDirection: "column",
    }}>
      <GoldenBackground />
      <Navbar />

      <Container maxWidth="lg" sx={{ px: 2, mt: 4, mb: 6, flex: 1, position: "relative", zIndex: 2 }}>
        <Box component="form" onSubmit={e => e.preventDefault()} sx={{ mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="h5">📍 Buscar lugares cerveceros</Typography>
            <Button
              variant="contained"
              onClick={() => setModalOpen(true)}
              sx={{ bgcolor: "#fbbf24", color: "black", "&:hover": { bgcolor: "#f59e0b" } }}
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
              sx={{ bgcolor: "#1f2937", borderRadius: 2, input: { color: "white" } }}
            />

            <TextField
              variant="outlined"
              fullWidth
              placeholder="🍺 Tipo de cerveza (opcional)"
              value={tipoCerveza}
              onChange={(e) => setTipoCerveza(e.target.value)}
              sx={{ bgcolor: "#1f2937", borderRadius: 2, input: { color: "white" } }}
            />
          </Stack>
        </Box>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lugaresFiltrados.map((lugar) => {
            const isFavorito = favoritos.includes(lugar._id);
            const calificacionPromedio = lugar.comentarios?.length
              ? lugar.comentarios.reduce((acc, c) => acc + c.puntuacion, 0) / lugar.comentarios.length
              : 0;

            return (
              <div
                key={lugar._id}
                onClick={() => window.location.href = `/lugares/${lugar._id}`}
                className="bg-[#1f2937] text-white rounded-2xl p-4 shadow-md space-y-3 cursor-pointer transition-transform hover:-translate-y-2 hover:shadow-lg"
              >
                {lugar.imagen && (
                  <img
                    src={`${API_URL}${lugar.imagen}`}
                    alt={lugar.nombre}
                    className="w-full h-64 object-cover rounded"
                  />
                )}

                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold truncate w-4/5">{lugar.nombre}</h2>
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

                <p className="text-sm text-gray-400">{lugar.direccion.ciudad}, {lugar.direccion.pais}</p>
                <Rating value={calificacionPromedio} precision={0.5} readOnly size="small" />
                <p className="text-xs text-yellow-400">{calificacionPromedio.toFixed(1)} / 5</p>
                <p className="text-sm text-amber-300">
                  💛 {favoritos.filter(f => f === lugar._id).length} saludos vikingos
                </p>

                <TextField
                  variant="outlined"
                  placeholder="Escribe un comentario..."
                  value={newComments[lugar._id] || ""}
                  onChange={(e) =>
                    setNewComments((prev) => ({ ...prev, [lugar._id]: e.target.value }))
                  }
                  sx={{
                    bgcolor: "#111827",
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
                    bgcolor: "#fbbf24",
                    color: "black",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#f59e0b" }
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

      <LugarFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchLugares();
        }}
        usuario={usuario}
      />
    </Box>
  );
}
