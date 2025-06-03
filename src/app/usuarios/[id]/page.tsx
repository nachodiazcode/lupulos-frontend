"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Usuario {
  _id: string;
  username: string;
  email: string;
  fotoPerfil?: string;
  followers?: string[];
  following?: string[];
}

const useAuth = () => {
  if (typeof window === "undefined") return { user: null, token: null };
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("authToken");
  return { user, token };
};

export default function UsuarioPage() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPerfil = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/${id}`);
      setPerfil(res.data.usuario);
      if (user && res.data.usuario.followers?.includes(user._id)) {
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("❌ Error al cargar perfil:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) fetchPerfil();
  }, [id, fetchPerfil]);

  const getFotoPerfilUrl = (fotoPerfil?: string): string | undefined => {
    if (!fotoPerfil) return undefined;
    if (fotoPerfil.startsWith("http")) return fotoPerfil;
    const path = fotoPerfil.startsWith("./") ? fotoPerfil.replace("./", "/") : fotoPerfil;
    return `${API_URL}${path}`;
  };

  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      await axios.post(`${API_URL}/api/follow/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(true);
      fetchPerfil();
    } catch (err) {
      console.error("❌ Error al seguir:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    setLoadingFollow(true);
    try {
      await axios.post(`${API_URL}/api/follow/${id}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(false);
      fetchPerfil();
    } catch (err) {
      console.error("❌ Error al dejar de seguir:", err);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <Typography sx={{ color: "#fff", textAlign: "center", mt: 5 }}>
        Cargando perfil...
      </Typography>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={6}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: "rgba(17, 24, 39, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={6}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack spacing={2} alignItems="center" flex={1}>
                <Avatar
                  src={getFotoPerfilUrl(perfil?.fotoPerfil) || "/default-avatar.jpg"}
                  sx={{
                    width: 130,
                    height: 130,
                    border: "3px solid #facc15",
                    boxShadow: "0 0 12px rgba(250, 204, 21, 0.4)",
                  }}
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#fff" }}>
                  {perfil?.username}
                </Typography>
                <Typography sx={{ color: "#d1d5db", fontSize: "0.9rem" }}>
                  {perfil?.email}
                </Typography>

                <Stack direction="row" spacing={4} mt={2}>
                  <Stack alignItems="center">
                    <Typography variant="h6" sx={{ color: "#facc15" }}>
                      {perfil?.followers?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      Seguidores
                    </Typography>
                  </Stack>
                  <Stack alignItems="center">
                    <Typography variant="h6" sx={{ color: "#facc15" }}>
                      {perfil?.following?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      Siguiendo
                    </Typography>
                  </Stack>
                </Stack>

                {user?._id !== id && (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      minWidth: 180,
                      fontWeight: "bold",
                      bgcolor: isFollowing ? "#dc2626" : "#facc15",
                      color: isFollowing ? "#fff" : "#000",
                      "&:hover": {
                        bgcolor: isFollowing ? "#b91c1c" : "#eab308",
                      },
                    }}
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    disabled={loadingFollow}
                  >
                    {loadingFollow ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : isFollowing ? (
                      "Dejar de seguir"
                    ) : (
                      "Seguir"
                    )}
                  </Button>
                )}
              </Stack>

              <Box flex={2}>
                <Typography variant="h6" fontWeight="bold" mb={1} sx={{ color: "#fff" }}>
                  Sobre el usuario
                </Typography>
                <Typography sx={{ color: "#d1d5db", lineHeight: 1.8 }}>
                  Este usuario aún no ha publicado una biografía… pero puedes seguirlo para ver sus futuras cervezas, lugares y opiniones. 🍻
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
