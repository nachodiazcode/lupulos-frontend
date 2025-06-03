"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

type User = {
  name: string;
};

export default function EditarLugarPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/auth/login");
    else setUser({ name: "Usuario" });
  }, [router]);

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const res = await fetch(`http://localhost:3940/api/location/${id}`);
        const data = await res.json();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
      } catch (error) {
        console.error("❌ Error al cargar lugar:", error);
        setMensaje("❌ No se pudo cargar el lugar");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLugar();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/auth/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:3940/api/location/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (res.ok) {
        router.push("/lugares");
      } else {
        const data = await res.json();
        setMensaje(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      setMensaje("❌ Error inesperado al guardar.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0e0e0e",
          color: "#fbbf24",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ animation: "pulse 1.5s infinite" }}>
          Cargando lugar... 🍻
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e0e0e",
        background: "linear-gradient(to bottom, #111827, #0f0f0f)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          px: 4,
          py: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f2937",
        }}
        >
        <Typography variant="h6" fontWeight="bold" color="#fbbf24">
          Lúpulos
        </Typography>
        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
            <Link href="/" >Inicio</Link>
            <Link href="/cervezas">Cervezas</Link>
            <Link href="/lugares" style={{ color: "#fbbf24" }}>Lugares</Link>
            <Link href="/posts">Comunidad</Link>
            <Link href="/planes">Planes</Link>
            <Link href="/auth/perfil">Mi cuenta</Link>
            {user ? (
              <button onClick={handleLogout}>Cerrar sesión</button>
            ) : (
              <Link href="/auth/login">Ingresar</Link>
            )}
        </Stack>
      </Box>

      {/* Formulario */}
      <Container maxWidth="sm" sx={{ py: 6, flexGrow: 1 }}>
        <Box
          sx={{
            bgcolor: "#1f2937",
            p: 4,
            borderRadius: 3,
            border: "1px solid #374151",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            ✏️ Editar Lugar
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              fullWidth
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />
            <TextField
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              multiline
              rows={4}
              fullWidth
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#fbbf24",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#facc15" },
              }}
            >
              Guardar cambios
            </Button>

            {mensaje && <Alert severity="warning">{mensaje}</Alert>}
          </form>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: "center", py: 4, fontSize: 14, color: "#9ca3af", borderTop: "1px solid #1f2937" }}>
        © {new Date().getFullYear()} Lúpulos App · Hecho con 🍺 por Nacho Díaz
      </Box>
    </Box>
  );
}