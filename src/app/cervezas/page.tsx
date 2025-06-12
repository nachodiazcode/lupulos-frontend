"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box, Button, Typography, Stack, TextField, Snackbar,
  Alert, Container, IconButton, Rating
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import BeerFormModal from "@/components/BeerFormModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940/api";

interface Review {
  comentario: string;
  calificacion: number;
  usuario?: { username: string; fotoPerfil?: string };
}

interface Cerveza {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  cerveceria: string;
  tipo: string;
  abv: number;
  likes: string[];
  reviews: Review[];
  calificacionPromedio?: number;
  usuario: { _id: string; username: string };
}

export default function CervezasPage() {
  const router = useRouter();
  const [cervezas, setCervezas] = useState<Cerveza[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ _id: string; username: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchCervezas();
  }, []);

  const fetchCervezas = async (query = "") => {
    try {
      const url = query
        ? `${API_URL}/api/beer/search?nombre=${query}`
        : `${API_URL}/api/beer`;
      const res = await axios.get(url);
      if (res.data.exito) setCervezas(res.data.datos);
    } catch (error) {
      console.error("❌ Error al obtener cervezas:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCervezas(searchQuery);
  };

  const toggleLike = async (beerId: string) => {
    if (!user) return;
    const cerveza = cervezas.find(c => c._id === beerId);
    const userHasLiked = cerveza?.likes.includes(user._id);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await axios.post(`${API_URL}/api/beer/${beerId}/${userHasLiked ? "unlike" : "like"}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage(userHasLiked ? "Like eliminado ❌" : "¡Saludo vikingo enviado! 🍻");
      setSnackbarColor(userHasLiked ? "#f87171" : "#fbbf24");
      setSnackbarOpen(true);
      fetchCervezas();
    } catch (error) {
      console.error("❌ Error al dar/retirar like:", error);
    }
  };

  const handleCommentSubmit = async (beerId: string) => {
    if (!user || !newComments[beerId]?.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/beer/${beerId}/review`, {
        comentario: newComments[beerId],
        calificacion: 5,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnackbarMessage("Comentario publicado 💬");
      setSnackbarColor("#6EE7B7");
      setSnackbarOpen(true);
      setNewComments(prev => ({ ...prev, [beerId]: "" }));
      fetchCervezas();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  if (!mounted) return null;

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", color: "white", display: "flex", flexDirection: "column" }}>
      <GoldenBackground />
      <Navbar />

      <Container maxWidth="lg" sx={{   px: 2, mt: 4, mb: 6, flex: 1, position: "relative", zIndex: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="h5">🔍 Buscar cervezas</Typography>
            {user && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: "#fbbf24", color: "black", "&:hover": { bgcolor: "#f59e0b" } }}
                onClick={() => setModalOpen(true)}
              >
                Subir Cerveza
              </Button>
            )}
          </Stack>

          <Box display="flex" justifyContent="flex-start" mt={4}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Ej: IPA, Stout, Kross..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ bgcolor: "#1f2937", borderRadius: 2, input: { color: "white" } }}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: "gray", mr: 1, ml: 1 }} /> }}
            />
          </Box>
        </Box>

        {/* Lista de cervezas */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={3}>
          {cervezas.map((beer) => {
            const userHasLiked = user && beer.likes.includes(user._id);
            return (
              <Box
                key={beer._id}
                onClick={() => router.push(`/cervezas/${beer._id}`)}
                sx={{ backgroundColor: "#1f2937", color: "white", borderRadius: 4, p: 3, boxShadow: 2, cursor: "pointer", display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                {beer.imagen && (
                  <Box
                    component="img"
                    src={`${API_URL}${beer.imagen}`}
                    alt={beer.nombre}
                    sx={{ width: "100%", borderRadius: 2, objectFit: "cover" }}
                  />
                )}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{beer.nombre}</Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(beer._id);
                    }}
                    sx={{ color: userHasLiked ? "#fbbf24" : "white" }}
                  >
                    {userHasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="gray">
                  {beer.tipo} · {beer.abv}% ABV
                </Typography>
                <Rating value={beer.calificacionPromedio || 0} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="#facc15">
                  {beer.calificacionPromedio?.toFixed(1) || "0.0"} / 5
                </Typography>
                <Typography variant="body2" color="gray">
                  Cervecería: {beer.cerveceria}
                </Typography>
                <Typography variant="body2" color="gray">
                  Subido por: <strong>{beer.usuario.username}</strong>
                </Typography>
                <Typography variant="body2" color="#fbbf24">
                  💛 {beer.likes.length} saludos vikingos
                </Typography>

                {user && (
                  <>
                    <TextField
                      variant="outlined"
                      placeholder="Escribe un comentario..."
                      value={newComments[beer._id] || ""}
                      onChange={(e) => setNewComments((prev) => ({ ...prev, [beer._id]: e.target.value }))}
                      sx={{ bgcolor: "#111827", borderRadius: 2, input: { color: "white" } }}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommentSubmit(beer._id);
                      }}
                      sx={{ mt: 2, bgcolor: "#fbbf24", "&:hover": { bgcolor: "#f59e0b" }, fontWeight: "bold" }}
                    >
                      Comentar 💬
                    </Button>
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        {/* MODAL */}
        <BeerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchCervezas();
          }}
          usuario={user}
        />
      </Container>

      <Footer />

      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        TransitionComponent={slideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert severity="success" sx={{ bgcolor: snackbarColor, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}