"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Avatar,
  Rating,
  TextField,
  Button,
  Typography,
  Stack,
  Container,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grow,
  Alert
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Usuario {
  _id: string;
  nombre: string;
  fotoPerfil?: string;
}

interface Comentario {
  _id: string;
  usuario: Usuario;
  comentario: string;
  puntuacion: number;
  fecha: string;
}

interface Lugar {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  direccion: {
    calle: string;
    ciudad: string;
    pais: string;
  };
  comentarios: Comentario[];
}

export default function LugarDetallePage() {
  const { id } = useParams();
  const router = useRouter();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [rating, setRating] = useState<number | null>(0);
  const [user, setUser] = useState<Usuario | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevaPuntuacion, setNuevaPuntuacion] = useState<number>(0);

  const [editLugarOpen, setEditLugarOpen] = useState(false);
  const [nombreLugar, setNombreLugar] = useState("");
  const [descripcionLugar, setDescripcionLugar] = useState("");
  const [direccion, setDireccion] = useState({ calle: "", ciudad: "", pais: "" });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchLugar();
  }, [id]);

  const fetchLugar = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/location/${id}`);
      setLugar(res.data.data);
      setNombreLugar(res.data.data.nombre);
      setDescripcionLugar(res.data.data.descripcion);
      setDireccion(res.data.data.direccion);
    } catch (error) {
      console.error("❌ Error al obtener lugar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comentario.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/location/${id}/review`, {
        comentario,
        puntuacion: rating || 5,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComentario("");
      setRating(0);
      setSnackbarMessage("Comentario publicado 🍻");
      setSnackbarColor("#38bdf8");
      setSnackbarOpen(true);
      fetchLugar();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const handleDeleteComentario = async (comentarioId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/api/location/${id}/review/${comentarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Comentario eliminado ❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      fetchLugar();
    } catch (error) {
      console.error("❌ Error al eliminar comentario:", error);
    }
  };

  const handleEditComentario = (comentario: Comentario) => {
    setEditandoId(comentario._id);
    setNuevoComentario(comentario.comentario);
    setNuevaPuntuacion(comentario.puntuacion);
  };

  const handleGuardarEdicion = async (comentarioId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/api/location/${id}/review/${comentarioId}`, {
        comentario: nuevoComentario,
        puntuacion: nuevaPuntuacion,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Comentario editado ✏️");
      setSnackbarColor("#4ade80");
      setSnackbarOpen(true);
      setEditandoId(null);
      fetchLugar();
    } catch (error) {
      console.error("❌ Error al editar comentario:", error);
    }
  };

  const handleActualizarLugar = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(`${API_URL}/api/location/${id}`, {
        nombre: nombreLugar,
        descripcion: descripcionLugar,
        direccion,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Lugar actualizado ✏️");
      setSnackbarColor("#4ade80");
      setSnackbarOpen(true);
      setEditLugarOpen(false);
      fetchLugar();
    } catch (error) {
      console.error("❌ Error al actualizar lugar:", error);
      setSnackbarMessage("Error al actualizar lugar");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
    }
  };

  const handleEliminarLugar = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSnackbarMessage("Debes iniciar sesión para eliminar lugares.");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      return;
    }
    if (!window.confirm("¿Estás seguro de que quieres eliminar este lugar?")) return;
    try {
      await axios.delete(`${API_URL}/api/location/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Lugar eliminado ❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      setTimeout(() => router.push("/lugares"), 2000);
    } catch (error: any) {
      console.error("❌ Error al eliminar lugar:", error);
      setSnackbarMessage(error.response?.status === 401 ? "No autorizado. Inicia sesión nuevamente." : "Error al eliminar lugar.");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
    }
  };

  if (loading || !lugar) {
    return <div className="p-10 text-white">Cargando lugar...</div>;
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(to bottom, rgb(30, 41, 59), rgb(15, 23, 42))" }}>
      <Navbar />
      {/* CONTENIDO OMITIDO PARA BREVEDAD (igual al tuyo) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="info" sx={{ backgroundColor: snackbarColor, color: "black" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Footer />
    </div>
  );
}
