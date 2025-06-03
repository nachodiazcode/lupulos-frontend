"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box, Container, Typography, CircularProgress, TextField, Stack,
  Button, IconButton, Tooltip, Zoom, Grid, Paper
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";
const amarillo = "#fbbf24";

interface Usuario {
  _id: string;
  username: string;
  fotoPerfil?: string;
}

interface Comentario {
  _id?: string;
  comentario: string;
  usuario?: Usuario;
}

interface Post {
  _id: string;
  titulo: string;
  contenido: string;
  imagenes?: string[];
  usuario?: Usuario;
  reacciones?: {
    meGusta: { count: number; usuarios: string[] };
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tituloEditado, setTituloEditado] = useState("");
  const [contenidoEditado, setContenidoEditado] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/post/${id}`);
      setPost(res.data.post);
      setTituloEditado(res.data.post.titulo);
      setContenidoEditado(res.data.post.contenido);
    } catch (err) {
      console.error("❌ Error al cargar post:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComentarios = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/post/${id}/comentarios`);
      setComentarios(res.data.comentarios);
    } catch (err) {
      console.error("❌ Error al cargar comentarios:", err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchPost();
    fetchComentarios();
  }, [id, fetchPost, fetchComentarios]);

  const toggleLike = async () => {
    if (!user?._id || !post) return;
    const yaDioLike = post.reacciones?.meGusta?.usuarios.includes(user._id);
    const endpoint = yaDioLike ? "unlike" : "like";

    try {
      await axios.post(`${API_URL}/api/post/${id}/${endpoint}`, {
        tipo: "meGusta",
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      fetchPost();
    } catch (err) {
      console.error("❌ Error al alternar like:", err);
    }
  };

  const enviarComentario = async () => {
    if (!comentario.trim() || !user?._id) return;
    try {
      await axios.post(`${API_URL}/api/post/${id}/comentario`, {
        contenido: comentario,
        usuarioId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setComentario("");
      fetchComentarios();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const eliminarPost = async () => {
    if (typeof window !== "undefined" && !window.confirm("¿Estás seguro que quieres eliminar este post?")) return;
    try {
      await axios.delete(`${API_URL}/api/post/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      router.push("/posts");
    } catch (error) {
      console.error("❌ Error al eliminar post:", error);
    }
  };

  const guardarCambios = async () => {
    try {
      await axios.put(`${API_URL}/api/post/${id}`, {
        titulo: tituloEditado,
        contenido: contenidoEditado
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setEditMode(false);
      fetchPost();
    } catch (error) {
      console.error("❌ Error al actualizar post:", error);
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" sx={{ background: "#111827" }}>
        <CircularProgress sx={{ color: amarillo }} />
      </Box>
    );
  }

  if (!post) {
    return <Typography color="error">Post no encontrado</Typography>;
  }

  const yaDioLike = post.reacciones?.meGusta?.usuarios.includes(user?._id || "");
  const esAutor = post.usuario?._id === user?._id;

  return (
    <Box sx={{ minHeight: "100vh", color: "white", background: "#111827" }}>
      <Navbar />
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Contenido del post */}
          <Grid item xs={12} md={7}>
            {editMode ? (
              <>
                <TextField fullWidth label="Título" value={tituloEditado}
                  onChange={(e) => setTituloEditado(e.target.value)}
                  sx={{ mb: 2, input: { color: "white" }, label: { color: "#bbb" } }} />
                <TextField fullWidth multiline rows={4} label="Contenido"
                  value={contenidoEditado}
                  onChange={(e) => setContenidoEditado(e.target.value)}
                  sx={{ mb: 2, textarea: { color: "white" }, label: { color: "#bbb" } }} />
                <Button variant="contained" onClick={guardarCambios}
                  sx={{ bgcolor: amarillo, color: "black", mr: 2 }}>Guardar cambios</Button>
                <Button variant="outlined" onClick={() => setEditMode(false)}
                  sx={{ color: "white", borderColor: "gray" }}>Cancelar</Button>
              </>
            ) : (
              <>
                <Typography variant="h4" fontWeight="bold" mb={2}>{post.titulo}</Typography>
                {post.imagenes?.[0] && (
                  <Image
                    src={`${API_URL}${post.imagenes[0]}`}
                    alt={post.titulo}
                    width={800}
                    height={400}
                    style={{ width: "100%", objectFit: "cover", borderRadius: 8, marginBottom: 16 }}
                  />
                )}
                <Typography variant="body1" mb={3}>{post.contenido}</Typography>
              </>
            )}

            <Typography variant="subtitle2" color="gray">
              Publicado por: @{post.usuario?.username}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              <Tooltip title={yaDioLike ? "Quitar saludo vikingo" : "Enviar saludo vikingo"} arrow TransitionComponent={Zoom}>
                <IconButton onClick={toggleLike} sx={{ color: yaDioLike ? amarillo : "white" }}>
                  {yaDioLike ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              <Typography>💛 {post.reacciones?.meGusta?.count ?? 0} saludos vikingos</Typography>

              {esAutor && !editMode && (
                <>
                  <Tooltip title="Editar" arrow>
                    <IconButton sx={{ color: "white" }} onClick={() => setEditMode(true)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar" arrow>
                    <IconButton sx={{ color: "white" }} onClick={eliminarPost}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Grid>

          {/* Comentarios */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" mb={2}>💬 Comentarios</Typography>

            <Stack spacing={2}>
              {comentarios.map((c) => (
                <Paper key={c._id || c.comentario} sx={{ bgcolor: "#1f2937", p: 2 }}>
                  <Typography fontWeight="bold">@{c.usuario?.username}</Typography>
                  <Typography variant="body2" color="gray">{c.comentario}</Typography>
                </Paper>
              ))}
            </Stack>

            <TextField
              fullWidth
              placeholder="Escribe tu comentario..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              sx={{ mt: 3, bgcolor: "#1f2937", input: { color: "white" }, borderRadius: 1 }}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: amarillo, color: "black" }}
              onClick={enviarComentario}
            >
              Comentar 💬
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
