"use client";

import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

import Image from "next/image";
import api from "@/lib/api";

type MinimalUser = { _id: string; username: string };

interface PlaceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: MinimalUser | null;
}

export default function PlaceFormModal({ open, onClose, onSuccess, user }: PlaceFormModalProps) {
  const [placeForm, setPlaceForm] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceForm({ ...placeForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    if (
      !placeForm.name ||
      !placeForm.description ||
      !placeForm.street ||
      !placeForm.city ||
      !placeForm.state ||
      !placeForm.country ||
      !imageFile
    ) {
      setError("Completa los campos obligatorios y selecciona una imagen.");
      return;
    }
    const formData = new FormData();
    const address = {
      street: placeForm.street,
      city: placeForm.city,
      state: placeForm.state,
      country: placeForm.country,
      postalCode: placeForm.postalCode,
    };

    formData.append("name", placeForm.name);
    formData.append("description", placeForm.description);
    formData.append("address", JSON.stringify(address));
    const ownerId = user?._id || (user as { id?: string } | null)?.id;
    if (ownerId) {
      formData.append("owner", ownerId);
    }
    formData.append("image", imageFile);

    try {
      await api.post("/location", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
          bgcolor: "var(--color-brown-modal)",
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
        <Typography variant="h5" gutterBottom sx={{ color: "primary.main", fontWeight: 600 }}>
          🏙️ Nuevo Lugar
        </Typography>

        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={placeForm.name}
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
          name="description"
          value={placeForm.description}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="Calle"
          name="street"
          value={placeForm.street}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />
        <TextField
          fullWidth
          label="Ciudad"
          name="city"
          value={placeForm.city}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="Estado"
          name="state"
          value={placeForm.state}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />
        <TextField
          fullWidth
          label="País"
          name="country"
          value={placeForm.country}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          label="Código postal"
          name="postalCode"
          value={placeForm.postalCode}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: "#ccc" } }}
          InputProps={{ sx: { color: "#fff" } }}
        />

        <Button
          variant="outlined"
          component="label"
          color="primary"
          sx={{
            mb: 2,
            transition: "all 0.3s",
            "&:hover": {
              bgcolor: "primary.main",
              color: "var(--color-brown-modal)",
              boxShadow: 2,
            },
          }}
        >
          Subir Imagen
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {error && (
          <Typography sx={{ color: "var(--color-error)", mb: 2, fontSize: 14 }}>{error}</Typography>
        )}

        {imagePreviewUrl && (
          <Box mb={2}>
            <Image
              src={imagePreviewUrl}
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
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 1, transition: "all 0.3s" }}
        >
          Publicar Lugar 🚀
        </Button>
      </Box>
    </Modal>
  );
}
