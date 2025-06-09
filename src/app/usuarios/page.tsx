"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Container,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SpaIcon from "@mui/icons-material/Spa";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app";

const tipoColor: Record<
  string,
  { bg: string; icon: React.ElementType; label: string }
> = {
  legendario: { bg: "#fbbf24", icon: EmojiEventsIcon, label: "LEGENDARIO" },
  activo: { bg: "#34d399", icon: FlashOnIcon, label: "ACTIVO" },
  nuevo: { bg: "#60a5fa", icon: SpaIcon, label: "NUEVO" },
  default: { bg: "#9ca3af", icon: SpaIcon, label: "DESCONOCIDO" },
};

interface Usuario {
  _id: string;
  username: string;
  email: string;
  fotoPerfil?: string;
  tipo?: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUsuarioActual(JSON.parse(storedUser));
      } catch (error) {
        console.error("❌ Error al parsear user desde localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user`);
        const data = (Array.isArray(res.data) ? res.data : res.data.usuarios || []).map(
          (u: Usuario, i: number) => ({
            ...u,
            tipo: i % 3 === 0 ? "legendario" : i % 3 === 1 ? "activo" : "nuevo",
          })
        );
        setUsuarios(data);
        setUsuariosFiltrados(data);
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtrados = usuarios.filter(
      (u) => u.username.toLowerCase().includes(value) || u.email.toLowerCase().includes(value)
    );
    setUsuariosFiltrados(filtrados);
  };

  const getFotoPerfil = (user: Usuario): string | undefined => {
    const path =
      user._id === usuarioActual?._id
        ? usuarioActual?.fotoPerfil
        : user.fotoPerfil;

    if (!path) return undefined;
    if (path.startsWith("http")) return path;

    const fixedPath = path.startsWith("./") ? path.replace("./", "/") : path;
    return `${API_URL}${fixedPath}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", color: "white" }}>
      <GoldenBackground />
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, py: 6, zIndex: 2 }}>
        <Typography variant="h4" sx={{ color: "#fbbf24", mb: 4, textAlign: "center", fontWeight: "bold" }}>
          👥 Usuarios registrados
        </Typography>

        <Box mb={5}>
          <TextField
            variant="outlined"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={handleSearch}
            fullWidth
            sx={{
              bgcolor: "#1f2937",
              borderRadius: 2,
              input: { color: "white" },
              "& fieldset": { border: "none" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
            gap={3}
          >
            {usuariosFiltrados.map((user) => {
              const tipo = user.tipo?.toLowerCase() || "default";
              const estilo = tipoColor[tipo];
              const Icono = estilo.icon;

              return (
                <Box
                  key={user._id}
                  sx={{
                    backgroundColor: "#111827",
                    borderRadius: 4,
                    p: 3,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 0 25px ${estilo.bg}80`,
                    },
                  }}
                >
                  <Avatar
                    src={getFotoPerfil(user)}
                    alt={user.username}
                    sx={{
                      bgcolor: estilo.bg,
                      width: 80,
                      height: 80,
                      fontSize: 32,
                      fontWeight: "bold",
                      mb: 2,
                      boxShadow: `0 0 12px ${estilo.bg}aa`,
                    }}
                  >
                    {!getFotoPerfil(user) && user.username.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                    {user.email}
                  </Typography>

                  <Chip
                    icon={<Icono />}
                    label={estilo.label}
                    sx={{
                      mt: 2,
                      fontWeight: "bold",
                      bgcolor: estilo.bg,
                      color: estilo.bg === "#fbbf24" ? "#000" : "#fff",
                    }}
                  />

                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: estilo.bg,
                      color: estilo.bg === "#fbbf24" ? "#000" : "#fff",
                      fontWeight: "bold",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": {
                        bgcolor: "#facc15",
                        color: "black",
                      },
                    }}
                    onClick={() => router.push(`/usuarios/${user._id}`)}
                  >
                    VER PERFIL
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
