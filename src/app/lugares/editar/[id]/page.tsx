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
import Image from "next/image";

type User = { name: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

export default function EditarLugarPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/auth/login");
    else setUser({ name: "Usuario" });
  }, [router]);

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const res = await fetch(`${API_URL}/location/${id}`);
        const data = await res.json();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setImagen(data.imagen);
      } catch (error) {
        console.error("❌ Error al cargar lugar:", error);
        setMensaje("❌ No se pudo cargar el lugar");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLugar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/location/${id}`, {
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

  const getImagenUrl = (img: string) => {
    if (!img) return "/no-image.png";
    const base = API_URL.replace(/\/+$/, "");
    const path = img.replace(/^\/+/, "");
    return `${base}/${path}`;
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
          <Link href="/">Inicio</Link>
          <Link href="/cervezas">Cervezas</Link>
          <Link href="/lugares" style={{ color: "#fbbf24" }}>Lugares</Link>
          <Link href="/posts">Comunidad</Link>
          <Link href="/planes">Planes</Link>
          <Link href="/auth/perfil">Mi cuenta</Link>
          {user ? (
            <button onClick={() => {
              localStorage.removeItem("authToken");
              setUser(null);
              router.push("/auth/login");
            }}>
              Cerrar sesión
            </button>
          ) : (
            <Link href="/auth/login">Ingresar</Link>
          )}
        </Stack>
      </Box>

      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: "#fbbf24", mb: 4 }}>
          🏙️ Editar Lugar
        </Typography>

        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
          justifyContent: "center",
        }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              backgroundColor: "#1f2937",
              p: 4,
              borderRadius: 3,
              border: "1px solid #374151",
              minWidth: "300px",
            }}
          >
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              fullWidth
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
              sx={{ mb: 2 }}
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

            {mensaje && <Alert severity="warning" sx={{ mt: 2 }}>{mensaje}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                bgcolor: "#fbbf24",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#facc15" },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>

          {imagen && (
            <Box
              sx={{
                flex: 1,
                minWidth: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
              }}
            >
              <Image
                src={getImagenUrl(imagen)}
                alt="Imagen del lugar"
                width={400}
                height={400}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </Box>
      </Container>

      <Box sx={{
        textAlign: "center",
        py: 4,
        fontSize: 14,
        color: "#aaa",
        borderTop: "1px solid #1f2937",
      }}>
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍺 por Nacho Díaz
      </Box>
    </Box>
  );
}
