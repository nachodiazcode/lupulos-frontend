"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  Snackbar,
  Alert,
  Container,
  IconButton,
  Rating,
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
import Image from "next/image";
import { getImageUrl } from "@/lib/constants";
import { useBeers } from "@/features/beers/hooks/useBeers";
import type { Beer } from "@/features/beers/model/types";

export default function CervezasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ _id: string; username: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { beers: cervezas, refreshBeers, onToggleLike, onCreateReview } = useBeers();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    refreshBeers();
  }, [refreshBeers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshBeers(searchQuery);
  };

  const toggleLike = async (beerId: string) => {
    if (!user) return;
    const cerveza = cervezas.find((c) => c._id === beerId);
    const userHasLiked = cerveza?.likes.includes(user._id);

    try {
      await onToggleLike(beerId);
      setSnackbarMessage(userHasLiked ? "Like eliminado ❌" : "¡Saludo vikingo enviado! 🍻");
      setSnackbarColor(userHasLiked ? "var(--color-error)" : "var(--color-amber-primary)");
      setSnackbarOpen(true);
      refreshBeers(searchQuery);
    } catch (error) {
      console.error("❌ Error al dar/retirar like:", error);
    }
  };

  const handleCommentSubmit = async (beerId: string) => {
    if (!user || !newComments[beerId]?.trim()) return;
    try {
      await onCreateReview(beerId, newComments[beerId]);

      setSnackbarMessage("Comentario publicado 💬");
      setSnackbarColor("#6EE7B7");
      setSnackbarOpen(true);
      setNewComments((prev) => ({ ...prev, [beerId]: "" }));
      refreshBeers(searchQuery);
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;
  const handleCloseSnackbar = () => setSnackbarOpen(false);
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
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Typography variant="h5">🔍 Buscar cervezas</Typography>
            {user && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "var(--color-amber-primary)",
                  color: "black",
                  "&:hover": { bgcolor: "var(--color-amber-hover)" },
                }}
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
              sx={{ borderRadius: 2 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, ml: 1 }} />,
              }}
            />
          </Box>
        </Box>

        {/* Lista de cervezas */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }}
          gap={3}
        >
          {cervezas.map((beer: Beer) => {
            const userHasLiked = user && beer.likes.includes(user._id);
            return (
              <Box
                key={beer._id}
                onClick={() => router.push(`/cervezas/${beer._id}`)}
                sx={{
                  backgroundColor: "var(--color-surface-card)",
                  color: "white",
                  borderRadius: 4,
                  p: 3,
                  boxShadow: 2,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "5 / 3",
                    borderRadius: "12px",
                    overflow: "hidden",
                    bgcolor: "var(--color-surface-card-alt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {beer.image && !failedImages.has(beer._id) ? (
                    <Image
                      src={getImageUrl(beer.image)}
                      alt={beer.name}
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                      onError={() =>
                        setFailedImages((prev) => new Set(prev).add(beer._id))
                      }
                    />
                  ) : (
                    <Typography
                      sx={{ fontSize: 48, lineHeight: 1, userSelect: "none" }}
                    >
                      🍺
                    </Typography>
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{beer.name}</Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(beer._id);
                    }}
                    sx={{ color: userHasLiked ? "var(--color-amber-primary)" : "white" }}
                  >
                    {userHasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="gray">
                  {beer.style} · {beer.abv}% ABV
                </Typography>
                <Rating value={beer.averageRating || 0} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="#facc15">
                  {beer.averageRating?.toFixed(1) || "0.0"} / 5
                </Typography>
                <Typography variant="body2" color="gray">
                  Cervecería: {beer.brewery}
                </Typography>
                <Typography variant="body2" color="gray">
                  Subido por: <strong>{beer.createdBy?.username ?? "—"}</strong>
                </Typography>
                <Typography variant="body2" color="var(--color-amber-primary)">
                  💛 {beer.likes.length} saludos vikingos
                </Typography>

                {user && (
                  <>
                    <TextField
                      variant="outlined"
                      placeholder="Escribe un comentario..."
                      value={newComments[beer._id] || ""}
                      onChange={(e) =>
                        setNewComments((prev) => ({ ...prev, [beer._id]: e.target.value }))
                      }
                      sx={{
                        bgcolor: "var(--color-surface-card-alt)",
                        borderRadius: 2,
                        input: { color: "white" },
                      }}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommentSubmit(beer._id);
                      }}
                      sx={{
                        mt: 2,
                        bgcolor: "var(--color-amber-primary)",
                        "&:hover": { bgcolor: "var(--color-amber-hover)" },
                        fontWeight: "bold",
                      }}
                    >
                      Comentar 💬
                    </Button>
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        <BeerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            refreshBeers(searchQuery);
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
