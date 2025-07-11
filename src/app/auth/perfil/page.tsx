"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Container,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

interface Usuario {
  _id: string;
  username: string;
  email?: string;
  ciudad?: string;
  pais?: string;
  sitioWeb?: string;
  bio?: string;
  pronombres?: string;
  fotoPerfil?: string;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<Omit<Usuario, "_id">>({
    username: "",
    email: "",
    ciudad: "",
    pais: "",
    sitioWeb: "",
    bio: "",
    pronombres: "",
    fotoPerfil: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        if (!userStr || !token) return;

        const user = JSON.parse(userStr);
        const { data } = await axios.get(`${API_URL}/auth/perfil/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.exito) {
          const usuario: Usuario = data.usuario;
          setPerfil(usuario);
          setFormData({
            username: usuario.username || "",
            email: usuario.email || "",
            ciudad: usuario.ciudad || "",
            pais: usuario.pais || "",
            sitioWeb: usuario.sitioWeb || "",
            bio: usuario.bio || "",
            pronombres: usuario.pronombres || "",
            fotoPerfil: usuario.fotoPerfil || "",
          });
        }
      } catch (error) {
        console.error("❌ Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!perfil) return;

      await axios.put(`${API_URL}/auth/perfil/${perfil._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode(false);
      setAlertOpen(true);
      localStorage.setItem("user", JSON.stringify({ ...perfil, ...formData }));
    } catch (error) {
      console.error("❌ Error al guardar perfil:", error);
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;

    try {
      const form = new FormData();
      form.append("fotoPerfil", file);
      const res = await axios.post(`${API_URL}/auth/upload/profile`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.exito) {
        const ruta = res.data.ruta;
        const token = localStorage.getItem("authToken");

        await axios.put(`${API_URL}/auth/perfil/${perfil._id}`, { fotoPerfil: ruta }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData((prev) => ({ ...prev, fotoPerfil: ruta }));
        setPerfil((prev) => prev ? { ...prev, fotoPerfil: ruta } : null);
        localStorage.setItem("user", JSON.stringify({ ...perfil, fotoPerfil: ruta }));
      }
    } catch (error) {
      console.error("❌ Error al subir la foto:", error);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="white">Cargando perfil...</Typography>
      </Box>
    );
  }

  const avatarURL = formData.fotoPerfil?.startsWith("/uploads")
    ? `${API_URL.replace(/\/api$/, "")}${formData.fotoPerfil}`
    : formData.fotoPerfil;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Paper sx={{ bgcolor: "#1e293b", p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: 4, mx: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={5} alignItems="flex-start">
            <Stack alignItems="center" spacing={2} minWidth={200}>
              <Avatar src={avatarURL} sx={{ width: 100, height: 100, border: "3px solid #fbbf24" }} />
              <Typography color="#fbbf24" fontWeight="bold" textAlign="center">
                {formData.username}
              </Typography>
              <Typography color="#cbd5e1" fontSize="14px" textAlign="center">
                {formData.email}
              </Typography>
              {editMode && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFotoUpload} accept="image/*" hidden />
                  <Button startIcon={<UploadIcon />} variant="outlined" onClick={triggerFileInput}
                    sx={{ color: "#fbbf24", borderColor: "#fbbf24", mt: 1 }}>
                    Subir Foto
                  </Button>
                </>
              )}
            </Stack>

            <Box flex={1}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ color: "#fbbf24", fontWeight: "bold" }}>
                    👤 Información Personal
                  </Typography>
                  <Tooltip title={editMode ? "Cancelar edición" : "Editar perfil"}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(!editMode)}
                      sx={{ color: "#fbbf24", borderColor: "#fbbf24" }}>
                      {editMode ? "Cancelar" : "Editar"}
                    </Button>
                  </Tooltip>
                </Stack>
                <Divider sx={{ borderColor: "#334155" }} />

                {["username", "ciudad", "pais", "sitioWeb", "bio", "pronombres"].map((name) => {
                  const labelMap: Record<string, string> = {
                    username: "Nombre de usuario",
                    ciudad: "Ciudad",
                    pais: "País",
                    sitioWeb: "Sitio Web",
                    bio: "Biografía",
                    pronombres: "Pronombres",
                  };
                  return (
                    <Box key={name}>
                      <Typography variant="subtitle2" color="#fbbf24" mb={0.5}>
                        {labelMap[name]}
                      </Typography>
                      {editMode ? (
                        <TextField
                          name={name}
                          value={formData[name as keyof typeof formData] || ""}
                          onChange={handleInputChange}
                          fullWidth
                          multiline={name === "bio"}
                          rows={name === "bio" ? 2 : undefined}
                          sx={textFieldStyle}
                        />
                      ) : (
                        <Typography sx={readFieldStyle}>{formData[name as keyof typeof formData] || "No especificado"}</Typography>
                      )}
                    </Box>
                  );
                })}

                {editMode && (
                  <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                    <Button variant="outlined" onClick={() => setEditMode(false)} sx={{ borderColor: "#fbbf24", color: "#fbbf24" }}>
                      Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleGuardar} sx={{ bgcolor: "#fbbf24", color: "black", "&:hover": { bgcolor: "#f59e0b" } }}>
                      Guardar Cambios
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert severity="success" sx={{ bgcolor: "#6EE7B7", color: "black" }}>¡Cambios guardados con éxito!</Alert>
      </Snackbar>
    </Box>
  );
}

const textFieldStyle = {
  input: { color: "#ffffff", fontWeight: 500, fontSize: "0.95rem" },
  "& label": { color: "#fbbf24" },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "6px",
    "& fieldset": { borderColor: "#4b5563" },
    "&:hover fieldset": { borderColor: "#fbbf24" },
    "&.Mui-focused fieldset": { borderColor: "#fbbf24" },
  },
};

const readFieldStyle = {
  p: 1,
  px: 2,
  bgcolor: "rgba(255,255,255,0.05)",
  borderRadius: 2,
  fontSize: "0.95rem",
  fontWeight: 500,
  color: "white",
};
