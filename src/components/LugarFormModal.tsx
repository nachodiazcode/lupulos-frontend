"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Snackbar,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: { _id: string; username: string; fotoPerfil?: string } | null;
}

export default function LugarFormModal({ open, onClose, onSuccess, usuario }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [pais, setPais] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = async () => {
    if (!nombre || !descripcion || !calle || !ciudad || !estado || !pais || !imagen) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!usuario) {
      alert("Usuario no autenticado.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("direccion", JSON.stringify({ calle, ciudad, estado, pais }));
    formData.append("usuario", usuario._id);
    formData.append("imagen", imagen);

    try {
      const token = localStorage.getItem("authToken");

      await axios.post(`${API_URL}/api/location`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setToastOpen(true);
      onSuccess();

      // Limpiar formulario
      setNombre("");
      setDescripcion("");
      setCalle("");
      setCiudad("");
      setEstado("");
      setPais("");
      setImagen(null);
      setPreview(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Error al subir lugar:", error.response?.data || error.message);
        alert(error.response?.data?.mensaje || "Ocurrió un error al subir el lugar.");
      } else {
        console.error("❌ Error inesperado:", error);
        alert("Error inesperado al subir el lugar.");
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1f2937",
            color: "white",
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: 20, color: "white" }}>
          📍 Nuevo Lugar Cervecero
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "white" } }}
            />

            <TextField
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "white" } }}
            />

            <TextField
              label="Calle"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#facc15" } }}
            />
            <TextField
              label="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#facc15" } }}
            />
            <TextField
              label="Estado o Región"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#facc15" } }}
            />
            <TextField
              label="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#facc15" } }}
            />

            <Button
              component="label"
              variant="outlined"
              sx={{
                borderColor: "#fbbf24",
                color: "#fbbf24",
                "&:hover": { bgcolor: "#fbbf24", color: "#1f2937" },
              }}
            >
              Subir Imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImagen(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </Button>

            {preview && (
              <Box>
                <Typography variant="body2" color="#fbbf24">
                  Previsualización:
                </Typography>
                <Image
                  src={preview}
                  alt="preview"
                  width={500}
                  height={300}
                  style={{ borderRadius: 8, marginTop: 8, width: "100%", height: "auto" }}
                />
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: "#fbbf24",
                color: "#1f2937",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#facc15" },
              }}
            >
              Publicar Lugar 🍻
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
            bgcolor: "#fbbf24",
            color: "#1f2937",
            borderRadius: "12px",
            boxShadow: 4,
            minWidth: 320,
          }}
        >
          <Avatar src={usuario?.fotoPerfil || ""} sx={{ width: 48, height: 48 }}>
            {usuario?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: "bold" }}>
            {usuario?.username} subiste un nuevo lugar 🍺
          </Typography>
        </Box>
      </Snackbar>
    </>
  );
}
