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
  Slide,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grow,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

interface Comentario {
  _id: string;
  usuario: {
    _id: string;
    nombre: string;
    fotoPerfil?: string;
  };
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
  const [user, setUser] = useState<any>(null);
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
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este comentario?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/api/location/${id}/review/${comentarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setSnackbarMessage("Comentario eliminado ❌");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
      fetchLugar(); // Recarga los comentarios
    } catch (error) {
      console.error("❌ Error al eliminar comentario:", error);
      setSnackbarMessage("Ocurrió un error al eliminar el comentario");
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
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
  
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este lugar?");
    if (!confirmDelete) return;
  
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
  
      if (error.response?.status === 401) {
        setSnackbarMessage("No autorizado. Inicia sesión nuevamente.");
      } else {
        setSnackbarMessage("Error al eliminar lugar.");
      }
  
      setSnackbarColor("#f87171");
      setSnackbarOpen(true);
    }
  };
  

  const slideTransition = (props: any) => <Slide {...props} direction="down" />;
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  if (loading || !lugar) {
    return <div className="p-10 text-white">Cargando lugar...</div>;
  }

  return (
    <div className="min-h-screen text-white" style={{
      background: "linear-gradient(to bottom, rgb(30, 41, 59), rgb(15, 23, 42))",
    }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={10}>
          <div className="w-full lg:w-[40%] flex justify-center">
            <img
              src={`${API_URL}${lugar.imagen}`}
              alt={lugar.nombre}
              className="rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain"
            />
          </div>

          <div className="w-full lg:w-[60%] space-y-8">
            <div>
              <Typography variant="h3" fontWeight="bold">{lugar.nombre}</Typography>
              <p className="text-gray-400 mt-1">{lugar.direccion.calle}, {lugar.direccion.ciudad}, {lugar.direccion.pais}</p>
              <p className="mt-4 text-lg">{lugar.descripcion}</p>

              {user && (
                <Stack direction="row" spacing={2} mt={2}>
                  <Button variant="outlined" color="info" onClick={() => setEditLugarOpen(true)}>
                    Editar Lugar ✏️
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleEliminarLugar}>
                    Eliminar Lugar 🗑️
                  </Button>
                </Stack>
              )}
            </div>

            {user && (
              <Stack spacing={2} sx={{ bgcolor: "#1e293b", p: 6, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight="bold">Tu opinión 🍻</Typography>
                <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} size="large" />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  sx={{ bgcolor: "#111827", borderRadius: 2, textarea: { color: "white" } }}
                />
                <Button
                  onClick={handleCommentSubmit}
                  variant="contained"
                  sx={{ bgcolor: "#f59e0b", fontWeight: "bold", "&:hover": { bgcolor: "#fbbf24" } }}
                >
                  Comentar 💬
                </Button>
              </Stack>
            )}

            <div className="mt-10">
              <Typography variant="h5" fontWeight="bold" mb={4}>Comentarios</Typography>
              {lugar.comentarios.length > 0 ? (
                lugar.comentarios.map((c) => (
                  <Stack
                    key={c._id}
                    direction="row"
                    spacing={2}
                    sx={{ bgcolor: "#1e293b", p: 3, borderRadius: 4, alignItems: "flex-start", mb: 4 }}
                  >
                    <Avatar src={c.usuario?.fotoPerfil || ""} />
                    <Stack>
                      <Typography fontWeight="bold">  {c.usuario?._id === user?._id ? "Tú" : c.usuario?.nombre || "Anónimo"} </Typography>
                      <Typography color="gray" fontSize={12}>{new Date(c.fecha).toLocaleDateString()}</Typography>

                      {editandoId === c._id ? (
                        <>
                          <TextField
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            multiline
                            rows={2}
                            sx={{ mt: 1, bgcolor: "#111827", borderRadius: 2, textarea: { color: "white" } }}
                          />
                          <Rating
                            value={nuevaPuntuacion}
                            onChange={(_, newValue) => setNuevaPuntuacion(newValue || 0)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                          <Stack direction="row" spacing={2} mt={2}>
                            <Button size="small" variant="contained" onClick={() => handleGuardarEdicion(c._id)}>
                              Guardar ✅
                            </Button>
                            <Button size="small" color="inherit" onClick={() => setEditandoId(null)}>
                              Cancelar
                            </Button>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Typography sx={{ mt: 1 }}>{c.comentario}</Typography>
                          <Rating value={c.puntuacion} readOnly size="small" sx={{ mt: 1 }} />
                          {user && c.usuario?._id === user._id && (
                            <Stack direction="row" spacing={1} mt={2}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => handleEditComentario(c)}
                              >
                                Editar ✏️
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteComentario(c._id)}
                              >
                                Eliminar ❌
                              </Button>
                            </Stack>
                          )}
                        </>
                      )}
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography color="gray">Sé el primero en comentar este lugar 🍻</Typography>
              )}
            </div>
          </div>
        </Stack>
      </Container>

      {/* Modal Editar Lugar */}
      <Dialog
        open={editLugarOpen}
        onClose={() => setEditLugarOpen(false)}
        TransitionComponent={Grow}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar Lugar 🍺</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Nombre" value={nombreLugar} onChange={(e) => setNombreLugar(e.target.value)} fullWidth />
            <TextField label="Descripción" value={descripcionLugar} onChange={(e) => setDescripcionLugar(e.target.value)} multiline rows={3} fullWidth />
            <TextField label="Calle" value={direccion.calle} onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })} fullWidth />
            <TextField label="Ciudad" value={direccion.ciudad} onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })} fullWidth />
            <TextField label="País" value={direccion.pais} onChange={(e) => setDireccion({ ...direccion, pais: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEditLugarOpen(false)}>Cancelar</Button>
          <Button onClick={handleActualizarLugar} variant="contained" color="success">
            Guardar ✅
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de mensajes */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        TransitionComponent={slideTransition}
        message={snackbarMessage}
        autoHideDuration={3000}
        ContentProps={{ sx: { bgcolor: snackbarColor, fontWeight: "bold", color: "black" } }}
      />
    </div>
  );
}