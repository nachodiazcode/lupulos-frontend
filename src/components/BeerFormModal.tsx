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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: Usuario | null;
}

interface Usuario {
  _id: string;
  username: string;
  fotoPerfil?: string;
}

export default function BeerFormModal({ open, onClose, onSuccess, usuario }: Props) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [cerveceria, setCerveceria] = useState("");
  const [abv, setAbv] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [calle, setCalle] = useState("");

  const handleSubmit = async () => {
    if (!nombre || !tipo || !cerveceria || !descripcion || !abv || !imagen) return;

    const abvValue = parseFloat(abv);
    if (isNaN(abvValue)) {
      alert("El ABV debe ser un número válido.");
      return;
    }

    if (!usuario) {
      alert("Usuario no autenticado.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("cerveceria", cerveceria);
    formData.append("abv", String(abvValue));
    formData.append("descripcion", descripcion);
    formData.append("usuario", usuario._id);
    formData.append("imagen", imagen);
    formData.append("direccion[calle]", calle);

    try {
      const token = localStorage.getItem("authToken");

      await axios.post(`${API_URL}/api/beer`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setToastOpen(true);
      onSuccess();

      setNombre("");
      setTipo("");
      setCerveceria("");
      setAbv("");
      setDescripcion("");
      setImagen(null);
      setPreview(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Error al subir cerveza:", error.response?.data || error.message);
        alert(error.response?.data?.mensaje || "Ocurrió un error al subir la cerveza.");
      } else {
        console.error("❌ Error inesperado:", error);
        alert("Error inesperado al subir la cerveza.");
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
          🍺 Nueva Cerveza
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {[["Nombre", nombre, setNombre], ["Tipo", tipo, setTipo], ["Cervecería", cerveceria, setCerveceria]].map(
              ([label, value, setter]) => (
                <TextField
                  key={label as string}
                  label={label as string}
                  value={value as string}
                  onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                  fullWidth
                  InputLabelProps={{ sx: { color: "#ccc" } }}
                  InputProps={{ sx: { color: "white" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#555" },
                      "&:hover fieldset": { borderColor: "#fbbf24" },
                    },
                  }}
                />
              )
            )}

            <TextField
              label="ABV (%)"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              type="number"
              fullWidth
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "white" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fbbf24" },
                },
              }}
            />

            <TextField
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              fullWidth
              multiline
              rows={3}
              InputLabelProps={{ sx: { color: "#ccc" } }}
              InputProps={{ sx: { color: "white" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#fbbf24" },
                },
              }}
            />

            <TextField
              label="Calle"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              fullWidth
              required
              sx={{ input: { color: "#facc15" }, label: { color: "#facc15" } }}
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
                  width={400}
                  height={300}
                  style={{ borderRadius: 8, marginTop: 8 }}
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
              Publicar Cerveza 🚀
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
          <Avatar
            src={usuario?.fotoPerfil || ""}
            sx={{ width: 48, height: 48 }}
          >
            {usuario?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: "bold" }}>
            {usuario?.username} subiste la cerveza exitosamente 🍺
          </Typography>
        </Box>
      </Snackbar>
    </>
  );
}
