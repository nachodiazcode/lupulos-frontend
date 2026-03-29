"use client";

import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

import Image from "next/image";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

type MinimalUser = { _id?: string; id?: string; username?: string };

const initialPlaceForm = {
  name: "",
  description: "",
  street: "",
  city: "",
  state: "",
  country: "Chile",
  postalCode: "",
  lat: "",
  lng: "",
  instagram: "",
};

interface PlaceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: MinimalUser | null;
}

export default function PlaceFormModal({ open, onClose, onSuccess, user }: PlaceFormModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [placeForm, setPlaceForm] = useState(initialPlaceForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const resetForm = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setStep(1);
    setPlaceForm(initialPlaceForm);
    setImageFile(null);
    setImagePreviewUrl(null);
    setError("");
    setSubmitting(false);
    setCategoria("");
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceForm({ ...placeForm, [e.target.name]: e.target.value });
  };

  const handleContinue = () => {
    setError("");

    if (!placeForm.name.trim() || !placeForm.city.trim()) {
      setError("Para reservar tu lugar necesitamos el nombre de tu local y la ciudad.");
      return;
    }

    setStep(2);
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
      setError(
        "Falta completar la ficha. Necesitamos descripción, dirección y una foto que haga justicia.",
      );
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

    if (placeForm.lat && placeForm.lng) {
      formData.append(
        "coordinates",
        JSON.stringify({ lat: parseFloat(placeForm.lat), lng: parseFloat(placeForm.lng) }),
      );
    }

    const ownerId = user?._id || user?.id;
    if (ownerId) {
      formData.append("owner", ownerId);
    }
    formData.append("image", imageFile);
    if (placeForm.instagram) formData.append("instagram", placeForm.instagram);
    if (categoria) formData.append("categoria", categoria);

    setSubmitting(true);
    try {
      await api.post("/location", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "var(--color-brown-modal)",
          border: "1px solid rgba(251,191,36,0.12)",
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
        {step === 1 ? (
          <>
            <Typography variant="h5" gutterBottom sx={{ color: "primary.main", fontWeight: 700 }}>
              🗺️ Haz que tu local sea parte de la ruta nacional
            </Typography>
            <Typography sx={{ color: "#d6d3d1", mb: 3, fontSize: 14, lineHeight: 1.7 }}>
              Tres datos y tu local entra a la ruta nacional de experiencias curadas. Los primeros
              en registrarse posicionan su comuna antes que la competencia.
            </Typography>

            <Box
              sx={{
                mb: 3,
                border: "1px solid rgba(251,191,36,0.22)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                background: "rgba(251,191,36,0.06)",
              }}
            >
              <Typography
                sx={{ color: "var(--color-amber-primary)", fontSize: 12, fontWeight: 700, mb: 0.5 }}
              >
                Red nacional · Early access
              </Typography>
              <Typography sx={{ color: "#e7e5e4", fontSize: 13, lineHeight: 1.6 }}>
                Los primeros en entrar posicionan su local antes que la competencia. Badge de
                identidad, posición preferente y presencia en la ruta nacional curada.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="¿Cómo se llama tu local?"
              name="name"
              value={placeForm.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#fff" } }}
            />

            <TextField
              fullWidth
              label="¿En qué comuna o ciudad está?"
              name="city"
              value={placeForm.city}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#fff" } }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#aaa", mb: 1.5, fontSize: 13, fontWeight: 600 }}
              >
                ¿Qué categoría define mejor a tu local?
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {[
                  { value: "patrimonio", label: "🏛️ Patrimonio Vivo" },
                  { value: "vanguardia", label: "🌆 Vanguardia Urbana" },
                  { value: "joya", label: "💎 Joya Oculta" },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoria(cat.value)}
                    style={{
                      borderRadius: 20,
                      border: `1px solid ${
                        categoria === cat.value
                          ? "var(--color-amber-primary)"
                          : "rgba(255,255,255,0.15)"
                      }`,
                      background:
                        categoria === cat.value
                          ? "rgba(251,191,36,0.14)"
                          : "rgba(255,255,255,0.04)",
                      color: categoria === cat.value ? "var(--color-amber-primary)" : "#ccc",
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </Box>
            </Box>

            {error && (
              <Typography sx={{ color: "var(--color-error)", mb: 2, fontSize: 14 }}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleContinue}
              sx={{ mt: 1, transition: "all 0.3s", fontWeight: 700 }}
            >
              Reservar mi lugar en la ruta nacional
            </Button>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  🚀 Sube tu nivel
                </Typography>
                <Typography sx={{ color: "#d6d3d1", fontSize: 14, lineHeight: 1.7 }}>
                  Danos tu @ de Instagram y nos encargamos de armar la ficha por ti. Tú pones la
                  esencia, nosotros hacemos el trabajo.
                </Typography>
              </Box>
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                sx={{ minWidth: "auto", px: 0.5 }}
              >
                Volver
              </Button>
            </Box>

            <Box
              sx={{
                mb: 3,
                border: "1px solid rgba(251,191,36,0.16)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                background: "rgba(251,191,36,0.05)",
              }}
            >
              <Typography sx={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, mb: 0.5 }}>
                Tesoro de Barrio · Configurando
              </Typography>
              <Typography sx={{ color: "#f5f5f4", fontSize: 13 }}>
                {placeForm.name} · {placeForm.city}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Tu @ de Instagram (opcional)"
              name="instagram"
              value={placeForm.instagram}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
              placeholder="@tulocal"
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "#fff" } }}
              helperText="Con tu @, rellenamos lo que podamos. Tú solo confirmas."
              FormHelperTextProps={{ sx: { color: "#888", fontSize: 12 } }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="La historia que se vive en tu local (opcional si tienes @)"
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
              label="Estado / región"
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

            <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
              📍 Coordenadas (opcional — para aparecer en el mapa)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Latitud"
                name="lat"
                type="number"
                value={placeForm.lat}
                onChange={handleInputChange}
                placeholder="ej: -33.4489"
                InputLabelProps={{ sx: { color: "#ccc" } }}
                InputProps={{ sx: { color: "#fff" } }}
              />
              <TextField
                fullWidth
                label="Longitud"
                name="lng"
                type="number"
                value={placeForm.lng}
                onChange={handleInputChange}
                placeholder="ej: -70.6693"
                InputLabelProps={{ sx: { color: "#ccc" } }}
                InputProps={{ sx: { color: "#fff" } }}
              />
            </Box>

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
              {imageFile ? "Cambiar Imagen" : "Subir Imagen"}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            {error && (
              <Typography sx={{ color: "var(--color-error)", mb: 2, fontSize: 14 }}>
                {error}
              </Typography>
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
              disabled={submitting}
              sx={{ mt: 1, transition: "all 0.3s", fontWeight: 700 }}
            >
              {submitting ? "Activando..." : "Activar mi presencia en la ruta 🗺️"}
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
