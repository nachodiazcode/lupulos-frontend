"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

interface Usuario {
  _id: string;
  nombre: string;
  fotoPerfil?: string;
}

interface Comentario {
  _id: string;
  usuario: Usuario;
  comentario: string;
  puntuacion: number;
  fecha: string;
}

interface Lugar {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  direccion: {
    calle: string;
    ciudad: string;
    pais: string;
  };
  comentarios: Comentario[];
}

export default function LugarDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [rating, setRating] = useState<number | null>(0);
  const [user, setUser] = useState<Usuario | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");

  const fetchLugar = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/location/${id}`);
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
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_URL}/api/location/${id}/review`,
        {
          comentario,
          puntuacion: rating || 5,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/api/location/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0f172a" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={6} alignItems="flex-start">
          <Box flexShrink={0}>
            <Image
              src={`${API_URL}${lugar.imagen}`}
              alt={lugar.nombre}
              width={400}
              height={400}
              className="rounded-lg object-cover shadow-xl"
              priority
            />
          </Box>

          <Box flex={1}>
            <Typography variant="h3" fontWeight="bold" textTransform="capitalize">
              {lugar.nombre}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: "#94a3b8" }}>
              {lugar.direccion.calle}, {lugar.direccion.ciudad}, {lugar.direccion.pais}
            </Typography>
            <Typography variant="body1" sx={{ mt: 3, color: "#e2e8f0" }}>
              {lugar.descripcion}
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
              <Paper sx={{ mt: 6, p: 4, bgcolor: "#1e293b", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Tu opinión 🍻
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  sx={{
                    mt: 2,
                    bgcolor: "#111827",
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
                    bgcolor: "#f59e0b",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#fbbf24" },
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
          {lugar.comentarios.length > 0 ? (
            lugar.comentarios.map((c) => (
              <Paper key={c._id} sx={{ p: 3, mb: 2, bgcolor: "#1f2937", borderRadius: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={c.usuario.fotoPerfil || ""} />
                  <Box>
                    <Typography fontWeight="bold">
                      {c.usuario._id === user?._id ? "Tú" : c.usuario.nombre}
                    </Typography>
                    <Typography fontSize={12} color="gray">
                      {new Date(c.fecha).toLocaleDateString()}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{c.comentario}</Typography>
                    <Rating value={c.puntuacion} readOnly size="small" />
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
