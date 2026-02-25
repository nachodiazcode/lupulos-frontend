"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Alert,
  Paper,
  AppBar,
  Toolbar,
  Snackbar,
  Slide,
  SlideProps,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CervezaFormData {
  name: string;
  brewery: string;
  style: string;
  abv: string;
  description: string;
}

export default function NuevaCervezaForm() {
  const [formData, setFormData] = useState<CervezaFormData>({
    name: "",
    brewery: "",
    style: "",
    abv: "",
    description: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [user, setUser] = useState<{ _id: string; username: string } | null>(null);
  const router = useRouter();

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const slideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, brewery, style, abv, description } = formData;

    if (!name || !brewery || !style || !abv || !description) {
      setError("Todos los campos marcados con * son obligatorios.");
      return;
    }
    if (Number(abv) < 0 || Number(abv) > 20) {
      setError("El ABV debe estar entre 0 y 20.");
      setError("El ABV debe estar entre 0 y 100.");
      return;
    }

    try {
      const form = new FormData();
      form.append("name", name);
      form.append("brewery", brewery);
      form.append("style", style);
      form.append("abv", String(Number(abv)));
      form.append("description", description);
      if (imagen) {
        form.append("image", imagen);
      }

      await api.post("/beer", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setSnackbarOpen(true);
      setError("");
      setFormData({
        name: "",
        brewery: "",
        style: "",
        abv: "",
        description: "",
      });
      setImagen(null);

      setTimeout(() => {
        router.push("/cervezas");
      }, 1200);
    } catch (err) {
      console.error("❌ Error al publicar cerveza:", err);
      setError("Hubo un error al subir la cerveza.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <Box sx={{ bgcolor: "#0e0e0e", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Menú superior */}
      <AppBar
        position="static"
        sx={{ bgcolor: "#0e0e0e", borderBottom: "1px solid var(--color-surface-card)" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold" color="var(--color-amber-primary)">
            Lúpulos
          </Typography>
          <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
            <Link href="/">Inicio</Link>
            <Link href="/cervezas" style={{ color: "var(--color-amber-primary)" }}>
              Cervezas
            </Link>
            <Link href="/lugares">Lugares</Link>
            <Link href="/posts">Comunidad</Link>
            <Link href="/planes">Planes</Link>
            <Link href="/auth/perfil">Mi cuenta</Link>
            {user ? (
              <button onClick={handleLogout}>Cerrar sesión</button>
            ) : (
              <Link href="/auth/login">Ingresar</Link>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Formulario */}
      <Container
        maxWidth="md"
        sx={{
          py: 8,
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom right, #0f172a, var(--color-surface-elevated))",
          borderRadius: 4,
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        <Paper
          elevation={4}
          sx={{ borderRadius: 3, p: 4, bgcolor: "var(--color-surface-card)", width: "100%" }}
        >
          <Typography
            variant="h5"
            align="center"
            mb={3}
            fontWeight="bold"
            color="var(--color-amber-primary)"
          >
            🍺 Nueva Cerveza
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {(
                [
                  { name: "name", label: "Nombre", type: "text" },
                  { name: "brewery", label: "Cervecería", type: "text" },
                  { name: "style", label: "Estilo", type: "text" },
                  { name: "abv", label: "ABV", type: "number" },
                ] as const
              ).map((field) => (
                <TextField
                  key={field.name}
                  label={`${field.label} *`}
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name]}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={field.name === "abv" ? { min: "0", max: "20", step: "0.1" } : {}}
                  InputProps={{ sx: { color: "white" } }}
                  InputLabelProps={{ sx: { color: "white" } }}
                />
              ))}
              <TextField
                label="Descripción"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                fullWidth
                InputProps={{ sx: { color: "white" } }}
                InputLabelProps={{ sx: { color: "white" } }}
              />

              <Button
                component="label"
                variant="outlined"
                sx={{
                  mt: 1,
                  borderColor: "var(--color-amber-primary)",
                  color: "var(--color-amber-primary)",
                  "&:hover": {
                    backgroundColor: "var(--color-amber-primary)",
                    color: "#000",
                  },
                }}
              >
                Subir imagen de la cerveza
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImagen(e.target.files?.[0] || null)}
                />
              </Button>

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">¡Cerveza publicada con éxito!</Alert>}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "var(--color-orange-cta)",
                  fontWeight: "bold",
                  color: "white",
                  "&:hover": { bgcolor: "var(--color-orange-cta-hover)" },
                }}
              >
                Publicar Cerveza 🍻
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar animado */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        TransitionComponent={slideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ bgcolor: "#6EE7B7", color: "black" }}>
          ¡Cerveza agregada con éxito! 🍻
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 4,
          borderTop: "1px solid var(--color-surface-card)",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍻 por Nacho Díaz
      </Box>
    </Box>
  );
}
