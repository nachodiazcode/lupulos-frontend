"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Rating,
  TextField,
  Button,
  Snackbar,
  Alert,
  Slide,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

const getRatingLabel = (rating: number | null) => {
  switch (rating) {
    case 1: return "😐 Regular";
    case 2: return "🍺 Aceptable";
    case 3: return "🍻 Buena";
    case 4: return "🔥 Muy buena";
    case 5: return "🤩 Excelente";
    default: return "";
  }
};

export default function DetalleCervezaPage() {
  const [editandoId, setEditandoId] = useState<string | null>(null);
const [nuevoComentario, setNuevoComentario] = useState("");
const [nuevaPuntuacion, setNuevaPuntuacion] = useState<number>(0);

  const { id } = useParams();
  const router = useRouter();
  const [beer, setBeer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#6EE7B7");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchBeer();
  }, [id]);

  const fetchBeer = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/beer/${id}`);
      // ⚠️ Validación para asegurar que sea un objeto, no array
      if (Array.isArray(res.data?.datos)) {
        setBeer(res.data?.datos[0]);
      } else {
        setBeer(res.data?.datos);
      }
    } catch (error) {
      console.error("❌ Error al obtener cerveza:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComentario = (review: any) => {
    setEditandoId(review._id);
    setNuevoComentario(review.comentario);
    setNuevaPuntuacion(review.calificacion);
  };
  
  const handleGuardarEdicion = async (reviewId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/api/beer/${id}/review/${reviewId}`, {
        comentario: nuevoComentario,
        calificacion: nuevaPuntuacion,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Comentario editado ✏️");
      setSnackbarColor("#4ade80");
      setSnackbarOpen(true);
      setEditandoId(null);
      fetchBeer();
    } catch (error) {
      console.error("❌ Error al editar comentario:", error);
    }
  };
  
  const handleDeleteComentario = async (reviewId: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar este comentario?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/api/beer/${id}/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Comentario eliminado ❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      fetchBeer();
    } catch (error) {
      console.error("❌ Error al eliminar comentario:", error);
    }
  };
  

  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/beer/${id}/rate`, { rating }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Gracias por tu calificación ⭐");
      setSnackbarColor("#facc15");
      setSnackbarOpen(true);
      fetchBeer();
    } catch (error) {
      console.error("❌ Error al calificar:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/beer/${id}/review`, {
        comentario: comment,
        calificacion: rating || 5,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComment("");
      setSnackbarMessage("Comentario publicado 💬");
      setSnackbarColor("#38bdf8");
      setSnackbarOpen(true);
      fetchBeer();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const handleDeleteBeer = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta cerveza?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/api/beer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Cerveza eliminada correctamente 🍺❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      setTimeout(() => router.push("/cervezas"), 2000);
    } catch (error) {
      console.error("❌ Error al eliminar cerveza:", error);
      setSnackbarMessage("Error al eliminar cerveza 😢");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
    }
  };

  const slideTransition = (props: any) => <Slide {...props} direction="down" />;
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  if (loading || !beer || !beer.nombre) {
    return <div className="p-10 text-white">Cargando cerveza...</div>;
  }

  return (
    <div className="min-h-screen text-white" >
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-start gap-16">
        <div className="w-full lg:w-[40%] flex justify-center">
          {beer.imagen && (
            <img
              src={`${API_URL}${beer.imagen}`}
              alt={beer.nombre}
              className="rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain"
            />
          )}
        </div>

        <div className="w-full lg:w-[60%] space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{beer.nombre}</h1>
            <p className="text-gray-400 mt-1">{beer.tipo} · {beer.abv}% ABV</p>
            <p className="mt-4 text-lg">{beer.descripcion}</p>
            <p className="text-sm text-gray-400 mt-2">Cervecería: {beer.cerveceria}</p>
            <p className="text-sm text-gray-400">Subido por: <b>{beer.usuario?.username}</b></p>

            {user && beer.usuario?._id === user._id && (
              <div className="flex gap-4 mt-6">
                <Button
                  variant="contained"
                  onClick={() => router.push(`/cervezas/editar/${beer._id}`)}
                  sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontWeight: "bold" }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDeleteBeer}
                  sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, fontWeight: "bold" }}
                >
                  🗑️ Eliminar
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Calificación promedio:</p>
            <div className="flex items-center gap-3">
              <Rating name="read-only" value={beer.calificacionPromedio || 0} precision={0.5} readOnly size="large" />
              <span className="text-lg font-semibold text-yellow-400">
                {beer.calificacionPromedio?.toFixed(1) || "0.0"} / 5
              </span>
            </div>
          </div>

          {user && (
            <div className="bg-[#1f2937] p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-semibold">Tu opinión 🍻</h2>
              <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} size="large" />
              <p className="text-yellow-400 font-medium">{getRatingLabel(rating)}</p>
              <Button
                onClick={handleRatingSubmit}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold mt-4"
                variant="contained"
              >
                Enviar Calificación
              </Button>
              <TextField
                fullWidth multiline rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                sx={{ bgcolor: "#111827", borderRadius: 2, mt: 4, mb: 2, textarea: { color: "white" } }}
              />
              <Button
                onClick={handleCommentSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                variant="contained"
              >
                Comentar 💬
              </Button>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Comentarios</h2>
            {beer.reviews?.map((review: any) => (
  <div key={review._id} className="bg-[#1f2937] p-4 rounded-xl mb-4 shadow-sm">
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar src={review.usuario?.fotoPerfil || ""} />
      <Typography fontWeight="bold">
        {review.usuario?._id === user?._id ? "Tú" : review.usuario?.username || "Anónimo"}
      </Typography>
    </Stack>

    {editandoId === review._id ? (
      <>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          sx={{ mt: 2, bgcolor: "#111827", borderRadius: 2, textarea: { color: "white" } }}
        />
        <Rating
          value={nuevaPuntuacion}
          onChange={(_, newValue) => setNuevaPuntuacion(newValue || 0)}
          size="small"
          sx={{ mt: 1 }}
        />
        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            onClick={() => handleGuardarEdicion(review._id)}
            sx={{ bgcolor: "#4ade80", color: "#000" }}
          >
            Guardar ✅
          </Button>
          <Button variant="outlined" onClick={() => setEditandoId(null)}>Cancelar</Button>
        </Stack>
      </>
    ) : (
      <>
        <p className="text-gray-300 mt-2">{review.comentario}</p>
        <Rating value={review.calificacion} readOnly size="small" className="mt-1" />
        {user && review.usuario?._id === user._id && (
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              size="small"
              variant="outlined"
              color="info"
              onClick={() => handleEditComentario(review)}
            >
              Editar ✏️
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleDeleteComentario(review._id)}
            >
              Eliminar ❌
            </Button>
          </Stack>
        )}
      </>
    )}
  </div>
))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
