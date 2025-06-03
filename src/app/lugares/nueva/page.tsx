"use client";

import React, { useState, forwardRef, ReactElement, Ref } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Stack,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Slide
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";
const amarillo = "#fbbf24";

// ✅ Transición corregida con forwardRef
const SlideTransition = forwardRef(function SlideTransition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});
export default function NuevaLugarPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState({
    calle: "",
    ciudad: "",
    estado: "",
    pais: "",
    codigoPostal: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleGuardarLugar = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No autenticado");

      // 1. Crear lugar
      const { data } = await axios.post(
        `${API_URL}/api/location`,
        {
          nombre,
          descripcion,
          direccion,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const nuevoLugarId = data.data._id;

      // 2. Subir imagen si existe
      if (imagen) {
        const formData = new FormData();
        formData.append("image", imagen);

        await axios.post(
          `${API_URL}/api/location/${nuevoLugarId}/upload-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setSnackbarMessage("✅ Lugar creado exitosamente");
      setSnackbarOpen(true);

      setTimeout(() => {
        router.push("/lugares");
      }, 2000);
    } catch (error) {
      console.error("❌ Error al guardar lugar:", error);
      setSnackbarMessage("❌ Error al guardar lugar");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e0e0e",
        background: "linear-gradient(to bottom, rgb(43,65,114), rgb(24,39,84))",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h4" mb={4}>
          ➕ Nuevo Lugar Cervecero
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Calle"
            variant="outlined"
            fullWidth
            value={direccion.calle}
            onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Ciudad"
            variant="outlined"
            fullWidth
            value={direccion.ciudad}
            onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Estado"
            variant="outlined"
            fullWidth
            value={direccion.estado}
            onChange={(e) => setDireccion({ ...direccion, estado: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="País"
            variant="outlined"
            fullWidth
            value={direccion.pais}
            onChange={(e) => setDireccion({ ...direccion, pais: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            type="file"
            fullWidth
            onChange={(e) => {
              const input = e.target as HTMLInputElement;
              if (input.files && input.files.length > 0) {
                setImagen(input.files[0]);
              }
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ input: { color: "white" } }}
          />


          <Button
            variant="contained"
            fullWidth
            sx={{ bgcolor: "#fbbf24", fontWeight: "bold" }}
            onClick={handleGuardarLugar}
          >
            Guardar Lugar 🍻
          </Button>
        </Stack>
      </Container>

      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        <Alert severity="success" sx={{ bgcolor: amarillo, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
