"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, TextField, Button,
  Alert
} from "@mui/material";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";
const amarillo = "#fbbf24";

const getImagenUrl = (img: string) => {
  if (!img) return "/no-image.png";
  const base = API_URL.replace(/\/+$/, "");
  const path = img.replace(/^\/+/, "");
  return `${base}/${path}`;
};

export default function EditarLugarPage() {
  const { id } = useParams();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/location/${id}`);
        const data = await res.json();
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setImagen(data.imagen || "");
      } catch (error) {
        console.error("❌ Error al cargar lugar:", error);
        setMensaje("❌ No se pudo cargar el lugar");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLugar();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setMensaje("No autenticado");
        return;
      }

      if (nuevaImagen) {
        const formData = new FormData();
        formData.append("imagen", nuevaImagen);

        const resUpload = await fetch(`${API_URL}/api/location/${id}/upload-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const dataUpload = await resUpload.json();
        setImagen(dataUpload.datos.imagen);
      }

      const res = await fetch(`${API_URL}/api/location/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMensaje(`❌ ${data.message}`);
      } else {
        router.push("/lugares");
      }
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      setMensaje("❌ Error inesperado al guardar.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0e0e0e", color: amarillo, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" sx={{ animation: "pulse 1.5s infinite" }}>
          Cargando Lugar... 🍻
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0e0e0e", background: "linear-gradient(to bottom, #111827, #0f0f0f)", color: "white", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: amarillo, mb: 4 }}>
          🏙️ Editar Lugar
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "flex-start", justifyContent: "center" }}>
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
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              margin="normal"
              required
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <TextField
              fullWidth
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <Button variant="outlined" component="label" color="secondary" sx={{ mt: 2 }}>
              Cambiar imagen
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>

            {mensaje && <Alert severity="warning" sx={{ mt: 2 }}>{mensaje}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                bgcolor: amarillo,
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#facc15" },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>

          {(preview || imagen) && (
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
                src={preview || getImagenUrl(imagen)}
                alt="Vista previa del lugar"
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

      <Box sx={{ textAlign: "center", py: 4, fontSize: 14, color: "#aaa", borderTop: "1px solid #1f2937" }}>
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍺 por Nacho Díaz
      </Box>
    </Box>
  );
}
