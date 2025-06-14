"use client";

import React, { useState } from "react";
import {
  Modal, Box, Typography, TextField, Button
} from "@mui/material";

import Image from "next/image";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: { _id: string; username: string } | null; // 👈 AGREGA ESTO
}

export default function LugarFormModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    ciudad: "",
    pais: "",
    calle: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken"); // 🔐 Agrega el token

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imagen) formData.append("imagen", imagen);

    try {
      await fetch(`${API_URL}/api/location`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Aquí va el token
        },
      });
      onSuccess();
    } catch (err) {
      console.error("❌ Error al subir lugar:", err);
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#3e2723",
          borderRadius: 5,
          boxShadow: 10,
          p: 4,
          width: "90%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#8d6e63",
            borderRadius: 3,
          },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: "#fbbf24", fontWeight: 600 }}
        >
          🏙️ Nuevo Lugar
        </Typography>

        <TextField
          fullWidth
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="Ciudad"
          name="ciudad"
          value={form.ciudad}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="País"
          name="pais"
          value={form.pais}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="Calle"
          name="calle"
          value={form.calle}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <Button
          variant="outlined"
          component="label"
          sx={{
            mb: 2,
            borderColor: "#fbbf24",
            color: "#fbbf24",
            transition: "all 0.3s",
            "&:hover": {
              bgcolor: "#fbbf24",
              color: "#3e2723",
              boxShadow: 2,
            },
          }}
        >
          Subir Imagen
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        {preview && (
          <Box mb={2}>
            <Image
              src={preview}
              alt="Vista previa"
              width={400}
              height={300}
              style={{
                borderRadius: 8,
                objectFit: "cover",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            bgcolor: "#fbbf24",
            color: "#3e2723",
            fontWeight: "bold",
            mt: 1,
            transition: "all 0.3s",
            "&:hover": {
              bgcolor: "#f59e0b",
              boxShadow: 3,
            },
          }}
        >
          Publicar Lugar 🚀
        </Button>
      </Box>
    </Modal>


  );
}