"use client";

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack
} from "@mui/material";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";
const estiloModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#1f2937",
  color: "white",
  p: 4,
  borderRadius: 4,
  width: "90%",
  maxWidth: 500,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: { _id: string; username: string } | null;
}

export default function LugarFormModal({ open, onClose, onSuccess, usuario }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario) {
      setError("Debes iniciar sesión para agregar un lugar");
      return;
    }

    if (!nombre || !descripcion || !ciudad || !pais || !imagen) {
      setError("Completa todos los campos");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("direccion[calle]", ""); // opcional
      formData.append("direccion[ciudad]", ciudad);
      formData.append("direccion[pais]", pais);
      formData.append("usuario", usuario._id);
      formData.append("imagen", imagen);

      await axios.post(`${API_URL}/api/location`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setNombre("");
      setDescripcion("");
      setCiudad("");
      setPais("");
      setImagen(null);
      setError("");
      onSuccess();
    } catch (err) {
      console.error("❌ Error al crear lugar:", err);
      setError("Error al crear lugar");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={estiloModal}>
        <Typography variant="h6" mb={2}>
          🏠 Agregar Lugar
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              fullWidth
              multiline
              required
            />
            <TextField
              label="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              fullWidth
              required
            />
<input
  id="input-imagen"
  type="file"
  accept="image/*"
  aria-label="Imagen del lugar"
  onChange={(e) => {
    if (e.target.files) setImagen(e.target.files[0]);
  }}
  className="input-file"
/>


            {error && <Typography color="error">{error}</Typography>}

            <Button type="submit" variant="contained" sx={{ bgcolor: "#fbbf24", color: "black", fontWeight: "bold" }}>
              Crear Lugar
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}
