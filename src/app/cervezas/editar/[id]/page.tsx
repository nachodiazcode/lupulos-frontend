"use client";

import { useParams, useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import Image from "next/image";

const amarillo = "#fbbf24";

interface Cerveza {
  nombre: string;
  cerveceria: string;
  tipo: string;
  abv: string;
  descripcion: string;
  imagen: string;
}

export default function EditarCervezaPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();
const params = useParams();


  const [cerveza, setCerveza] = useState<Cerveza>({
    nombre: "",
    cerveceria: "",
    tipo: "",
    abv: "",
    descripcion: "",
    imagen: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCerveza = async () => {
      try {
        const res = await axios.get(`http://localhost:3940/api/beer/${id}`);
        const data = res.data?.datos;
        if (data) {
          setCerveza({
            nombre: data.nombre || "",
            cerveceria: data.cerveceria || "",
            tipo: data.tipo || "",
            abv: data.abv?.toString() || "",
            descripcion: data.descripcion || "",
            imagen: data.imagen || "",
          });
        } else {
          setError("No se encontró la cerveza.");
        }
      } catch (err) {
        const errorMsg = (err as Error).message || "Error desconocido";
        console.error("❌ Error al cargar cerveza:", errorMsg);
        setError("Error al cargar los datos de la cerveza.");
      }
    };

    if (id) fetchCerveza();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCerveza((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
      setPreview(URL.createObjectURL(file));
    }
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
      if (nuevaImagen) {
        const formData = new FormData();
        formData.append("imagen", nuevaImagen);

        const resUpload = await axios.post(
          `http://localhost:3940/api/beer/${id}/upload-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        cerveza.imagen = resUpload.data.datos.imagen;
      }

      await axios.put(
        `http://localhost:3940/api/beer/${id}`,
        { ...cerveza, abv: parseFloat(cerveza.abv) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      sessionStorage.setItem("cervezaEditada", `¡Editaste la cerveza con éxito ${user?.username || "usuario"}! Salud 🍻`);
      setSuccess(true);
      setTimeout(() => {
        router.push("/cervezas");
      }, 1200);
    } catch (err) {
      const errorMsg = (err as Error).message || "Error al actualizar";
      console.error("❌ Error al actualizar cerveza:", errorMsg);
      setError("No se pudo actualizar la cerveza.");
    }
  };

  const campos: (keyof Cerveza)[] = ["nombre", "cerveceria", "tipo", "abv"];

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0e0e0e",
        background: "linear-gradient(to bottom, #111827, #0f0f0f)",
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
              backgroundColor: "#1f2937",
              p: 4,
              borderRadius: 3,
              border: "1px solid #374151",
              minWidth: "300px",
            }}
          >
            {campos.map((campo) => (
              <TextField
                key={campo}
                fullWidth
                label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                name={campo}
                value={cerveza[campo]}
                onChange={handleChange}
                margin="normal"
                type={campo === "abv" ? "number" : "text"}
                InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
              />
            ))}

            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={cerveza.descripcion}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              InputProps={{ style: { backgroundColor: "#374151", color: "white" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <Button variant="outlined" component="label" color="secondary" sx={{ mt: 2 }}>
              Cambiar imagen
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>¡Cerveza actualizada con éxito!</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                bgcolor: amarillo,
                color: "#000",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#facc15" },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>

          {(preview || cerveza.imagen) && (
            <Box
              sx={{
                flex: 1,
                minWidth: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
              }}
            >
              <Image
                src={preview || `http://localhost:3940${cerveza.imagen}`}
                alt="Vista previa de la cerveza"
                width={400}
                height={400}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "12px",
                  objectFit: "contain",
                  height: "auto",
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
          borderTop: "1px solid #1f2937",
        }}
      >
        © {new Date().getFullYear()} Lúpulos · Hecho con 🍻 por Nacho Díaz
      </Box>
    </Box>
  );
}
