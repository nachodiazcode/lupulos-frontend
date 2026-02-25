"use client";

import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import { Box, TextField, Button, Typography, Container, Alert } from "@mui/material";

const amarillo = "var(--color-amber-primary)";

interface Cerveza {
  name: string;
  brewery: string;
  style: string;
  abv: string;
  description: string;
  image?: string;
}

const getImagenUrl = (imagen: string): string => {
  if (!imagen) return "/no-image.png";
  if (imagen.startsWith("http")) return imagen;

  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = imagen.replace(/^\/+/, "");

  return `${base}/${path}`;
};

export default function EditarCervezaPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [cerveza, setCerveza] = useState<Cerveza>({
    name: "",
    brewery: "",
    style: "",
    abv: "",
    description: "",
    image: "",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchCerveza = async () => {
      try {
        const res = await api.get(`/beer/${id}`);
        const data = res.data?.data;
        if (data) {
          setCerveza({
            name: data.name || "",
            brewery: data.brewery || "",
            style: data.style || "",
            abv: data.abv?.toString() || "",
            description: data.description || "",
            image: data.image || "",
          });
        } else {
          setError("No se encontró la cerveza.");
        }
      } catch (err) {
        console.error("❌ Error al cargar cerveza:", err);
        setError("Ocurrió un error al cargar los datos.");
      }
    };

    if (id) fetchCerveza();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCerveza((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!token) {
      setError("No estás autenticado.");
      return;
    }

    try {
      await api.put(`/beer/${id}`, {
        name: cerveza.name,
        brewery: cerveza.brewery,
        style: cerveza.style,
        abv: parseFloat(cerveza.abv),
        description: cerveza.description,
      });

      sessionStorage.setItem(
        "cervezaEditada",
        `¡Editaste la cerveza con éxito ${user?.username || "usuario"}! Salud 🍻`,
      );
      setSuccess(true);
      setTimeout(() => router.push("/cervezas"), 1200);
    } catch (err) {
      console.error("❌ Error al actualizar cerveza:", err);
      setError("No se pudo actualizar la cerveza.");
    }
  };

  const campos: { name: keyof Cerveza; label: string; type?: string }[] = [
    { name: "name", label: "Nombre" },
    { name: "brewery", label: "Cervecería" },
    { name: "style", label: "Estilo" },
    { name: "abv", label: "ABV", type: "number" },
  ];

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e0e0e",
        background: "linear-gradient(to bottom, var(--color-surface-card-alt), #0f0f0f)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, flexGrow: 1 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: amarillo, mb: 4 }}>
          🍺 Editar Cerveza
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              backgroundColor: "var(--color-surface-card)",
              p: 4,
              borderRadius: 3,
              border: "1px solid #374151",
              minWidth: "300px",
            }}
          >
            {campos.map((campo) => (
              <TextField
                key={campo.name}
                fullWidth
                label={campo.label}
                name={campo.name}
                value={cerveza[campo.name]}
                onChange={handleChange}
                margin="normal"
                type={campo.type || "text"}
                InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
              />
            ))}

            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={cerveza.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ¡Cerveza actualizada con éxito!
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                bgcolor: amarillo,
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "var(--color-amber-light)" },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>

          {cerveza.image && (
            <Box
              sx={{
                flex: 1,
                minWidth: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                backgroundColor: "var(--color-surface-card)",
                border: "1px solid #374151",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImagenUrl(cerveza.image)}
                alt="Vista previa de la cerveza"
                width={400}
                height={400}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.png";
                }}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </Box>
      </Container>

      <Box
        sx={{
          textAlign: "center",
          py: 4,
          fontSize: 14,
          color: "#aaa",
          borderTop: "1px solid var(--color-surface-card)",
        }}
      >
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍻 por Nacho Díaz
      </Box>
    </Box>
  );
}
