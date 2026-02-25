"use client";

import React, { useState, forwardRef, ReactElement, Ref } from "react";
import { api } from "@/lib/api";
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
  Slide,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
const amarillo = "var(--color-amber-primary)";

// ✅ Transición corregida con forwardRef
const SlideTransition = forwardRef(function SlideTransition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});
export default function NuevaLugarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleGuardarLugar = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No autenticado");

      if (
        !name ||
        !description ||
        !address.street ||
        !address.city ||
        !address.state ||
        !address.country ||
        !imagen
      ) {
        setSnackbarMessage("Completa los campos obligatorios y selecciona una imagen.");
        setSnackbarOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("address", JSON.stringify(address));
      formData.append("image", imagen);
      const userStr = localStorage.getItem("user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const userId = parsedUser?._id || parsedUser?.id;
      if (userId) formData.append("owner", userId);

      await api.post(`/location`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Calle"
            variant="outlined"
            fullWidth
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Ciudad"
            variant="outlined"
            fullWidth
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Estado"
            variant="outlined"
            fullWidth
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="País"
            variant="outlined"
            fullWidth
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            sx={{ input: { color: "white" }, "& fieldset": { borderColor: "#374151" } }}
          />
          <TextField
            label="Código postal"
            variant="outlined"
            fullWidth
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
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
            sx={{ bgcolor: "var(--color-amber-primary)", fontWeight: "bold" }}
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
