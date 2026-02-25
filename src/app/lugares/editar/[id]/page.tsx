"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import { Box, Container, Typography, TextField, Button, Alert } from "@mui/material";

const amarillo = "var(--color-amber-primary)";

interface Lugar {
  name: string;
  description: string;
  coverImage: string;
}

const getImagenUrl = (imagen: string): string => {
  if (!imagen) return "/no-image.png";
  if (imagen.startsWith("http")) return imagen;

  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = imagen.replace(/^\/+/, "");

  return `${base}/${path}`;
};

export default function EditarLugarPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lugar, setLugar] = useState<Lugar>({
    name: "",
    description: "",
    coverImage: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const res = await api.get(`/location/${id}`);
        const data = res.data?.data;

        if (!data) throw new Error("Lugar no encontrado");

        setLugar({
          name: data.name || "",
          description: data.description || "",
          coverImage: data.coverImage || "",
        });
      } catch (err) {
        console.error("❌ Error al cargar lugar:", err);
        setError("No se pudo cargar el lugar.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLugar();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLugar((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No estás autenticado.");
      return;
    }

    try {
      if (nuevaImagen) {
        const formData = new FormData();
        formData.append("image", nuevaImagen);

        const resUpload = await api.post(`/location/${id}/image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        lugar.coverImage = resUpload.data.data?.coverImage || lugar.coverImage;
      }
      await api.patch(`/location/${id}`, {
        name: lugar.name,
        description: lugar.description,
      });

      setSuccess(true);
      setTimeout(() => router.push("/lugares"), 1200);
    } catch (err) {
      console.error("❌ Error al actualizar lugar:", err);
      setError("No se pudo actualizar el lugar.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0e0e0e",
          color: amarillo,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Cargando lugar... 🍻</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e0e0e",
        background: "linear-gradient(to bottom, var(--color-surface-card-alt), #0f0f0f)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, flexGrow: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: amarillo, mb: 4 }}>
          🏙️ Editar Lugar
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              backgroundColor: "var(--color-surface-card)",
              p: 4,
              borderRadius: 3,
              border: "1px solid #374151",
              minWidth: "300px",
            }}
          >
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={lugar.name}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={lugar.description}
              onChange={handleChange}
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

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ¡Lugar actualizado con éxito!
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                bgcolor: amarillo,
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "var(--color-amber-light)" },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>

          {(preview || lugar.coverImage) && (
            <Box
              sx={{
                flex: 1,
                minWidth: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                backgroundColor: "var(--color-surface-card)",
                border: "1px solid #374151",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || getImagenUrl(lugar.coverImage)}
                alt="Vista previa del lugar"
                width={400}
                height={400}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.png";
                }}
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

      <Box
        sx={{
          textAlign: "center",
          py: 4,
          fontSize: 14,
          color: "#aaa",
          borderTop: "1px solid var(--color-surface-card)",
        }}
      >
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍺 por Nacho Díaz
      </Box>
    </Box>
  );
}
