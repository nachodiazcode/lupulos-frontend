"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Grid,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Usuario {
  _id: string;
  username: string;
  email: string;
  fotoPerfil?: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user`);
        setUsuarios(res.data || []);
        setUsuariosFiltrados(res.data || []);
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
      (u) =>
        u.username.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value)
    );
    setUsuariosFiltrados(filtrados);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <GoldenBackground />
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          px: 2,
          mt: 4,
          mb: 6,
          flex: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#fbbf24",
            mb: 4,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          👥 Usuarios registrados
        </Typography>

        {/* 🔍 Buscador */}
        <Box mb={5}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SearchIcon sx={{ color: "#fbbf24" }} />
            <TextField
              variant="outlined"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={handleSearch}
              fullWidth
              sx={{
                input: { color: "white" },
                bgcolor: "#1f2937",
                borderRadius: 2,
              }}
            />
          </Stack>
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <Grid
            container
            spacing={4}
            justifyContent="center"
            sx={{ maxWidth: "1300px", mx: "auto" }}
          >
            {usuariosFiltrados.map((usuario) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={usuario._id}>
                <Box
                  sx={{
                    backgroundColor: "#1f2937",
                    borderRadius: 3,
                    boxShadow: 4,
                    p: 3,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.03)",
                    },
                  }}
                >
                  <Avatar
                    src={usuario.fotoPerfil}
                    alt={usuario.username}
                    sx={{
                      bgcolor: "#fbbf24",
                      width: 70,
                      height: 70,
                      mx: "auto",
                      fontSize: 28,
                    }}
                  >
                    {usuario.fotoPerfil
                      ? ""
                      : usuario.username.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography variant="h6" mt={2} sx={{ color: "white" }}>
                    {usuario.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                    {usuario.email}
                  </Typography>

                  <Button
                    variant="outlined"
                    sx={{
                      mt: 2,
                      borderColor: "#fbbf24",
                      color: "#fbbf24",
                      "&:hover": {
                        backgroundColor: "#fbbf24",
                        color: "#000",
                      },
                    }}
                  >
                    Ver perfil
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
