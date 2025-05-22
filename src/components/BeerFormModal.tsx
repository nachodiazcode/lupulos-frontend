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
    if (
      !nombre.trim() ||
      !tipo.trim() ||
      !cerveceria.trim() ||
      !descripcion.trim() ||
      !abv.trim() ||
      !imagen
    ) {
      return;
    }


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
    formData.append("usuario", usuario._id); // ✅ Agregamos el ID del usuario

    if (imagen) formData.append("imagen", imagen);

    try {
      const token = localStorage.getItem("authToken");
      console.log("Enviando cerveza con:", {
        nombre,
        tipo,
        cerveceria,
        abv: abvValue,
        descripcion,
        usuario: usuario._id,
        imagen
      });

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      if (!imagen) {
        alert("La imagen es obligatoria.");
        return;
      }



      await axios.post(`${API_URL}/api/beer`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();

      // Limpieza después de publicar
      setNombre("");
      setTipo("");
      setCerveceria("");
      setAbv("");
      setDescripcion("");
      setImagen(null);
      setPreview(null);
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
          bgcolor: "#1e293b",
          color: "white",
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: 20 }}>
        🍺 Nueva Cerveza
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#fbbf24" } }}
            InputProps={{ style: { color: "white" } }}
          />
          <TextField
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#fbbf24" } }}
            InputProps={{ style: { color: "white" } }}
          />
          <TextField
            label="Cervecería"
            value={cerveceria}
            onChange={(e) => setCerveceria(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#fbbf24" } }}
            InputProps={{ style: { color: "white" } }}
          />
          <TextField
            label="ABV (%)"
            value={abv}
            onChange={(e) => setAbv(e.target.value)}
            fullWidth
            type="number"
            InputLabelProps={{ style: { color: "#fbbf24" } }}
            InputProps={{ style: { color: "white" } }}
          />
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputLabelProps={{ style: { color: "#fbbf24" } }}
            InputProps={{ style: { color: "white" } }}
          />

          <Button
            component="label"
            variant="outlined"
            sx={{ borderColor: "#fbbf24", color: "#fbbf24" }}
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
              bgcolor: "#f97316",
              color: "black",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            Publicar Cerveza 🚀
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
