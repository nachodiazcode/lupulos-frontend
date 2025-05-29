"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Stack
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: { _id: string; username: string } | null;
}

export default function BeerFormModal({ open, onClose, onSuccess, usuario }: Props) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [cerveceria, setCerveceria] = useState("");
  const [abv, setAbv] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

    try {
      const token = localStorage.getItem("authToken");

      await axios.post(`${API_URL}/api/beer`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess();
      setNombre(""); setTipo(""); setCerveceria(""); setAbv("");
      setDescripcion(""); setImagen(null); setPreview(null);
    } catch (error: any) {
      console.error("❌ Error al subir cerveza:", error.response?.data || error.message);
      alert(error.response?.data?.mensaje || "Ocurrió un error al subir la cerveza.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1f2937", // fondo dark
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
          {[["Nombre", nombre, setNombre], ["Tipo", tipo, setTipo], ["Cervecería", cerveceria, setCerveceria]].map(([label, value, setter]) => (
            <TextField
              key={label}
              label={label as string}
              value={value}
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
          ))}

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
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }}
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
  );
}
