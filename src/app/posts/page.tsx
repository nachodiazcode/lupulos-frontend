"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, Container, Stack, Modal,
  CircularProgress, IconButton, Tooltip, Zoom
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";
const amarillo = "#fbbf24";

interface Usuario {
  _id: string;
  username: string;
  fotoPerfil?: string;
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

export default function PostPage() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) setUser(JSON.parse(storedUser));
    fetchPosts();
  }, []);

  useEffect(() => {
    if (imagen) {
      const url = URL.createObjectURL(imagen);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagen]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/post`);
      setPosts(res.data?.posts || []);
    } catch (err) {
      console.error("❌ Error al obtener posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user?._id) return;
    const postActual = posts.find(p => p._id === postId);
    const yaDioLike = postActual?.reacciones?.meGusta?.usuarios.includes(user._id);
    const endpoint = yaDioLike ? "unlike" : "like";

    try {
      await axios.post(`${API_URL}/api/post/${postId}/${endpoint}`, {
        tipo: "meGusta",
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al alternar like:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      let imagePath = "";
      if (imagen) {
        const formData = new FormData();
        formData.append("imagen", imagen);
        const res = await axios.post(`${API_URL}/api/post/upload`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        imagePath = res.data.ruta;
      }
      await axios.post(`${API_URL}/api/post`, {
        titulo,
        contenido,
        imagenes: imagePath ? [imagePath] : [],
        usuario: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setTitulo("");
      setContenido("");
      setImagen(null);
      setPreview(null);
      setModalAbierto(false);
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al subir post:", err);
    }
  };

  if (!isClient || loading) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" sx={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}>
        <CircularProgress sx={{ color: amarillo }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh",color: "white", display: "flex", flexDirection: "column" }}>
      <GoldenBackground />
      <Navbar />

      <Container maxWidth="lg" sx={{ px: 2, flex: 1, pb: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h5" fontWeight="bold">📢 Comunidad cervecera</Typography>
          <Button onClick={() => setModalAbierto(true)} variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: amarillo, color: "#000", fontWeight: "bold" }}>
            SUBIR POST
          </Button>
        </Stack>

        <TextField fullWidth placeholder="🔍 Buscar por título o contenido..." value={filtro} onChange={(e) => setFiltro(e.target.value)}
          sx={{ mb: 6, bgcolor: "#1f2937", borderRadius: 2, input: { color: "white" } }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts
            .filter(p => p.titulo.toLowerCase().includes(filtro.toLowerCase()) || p.contenido.toLowerCase().includes(filtro.toLowerCase()))
            .map(post => {
              const yaDioLike = post.reacciones?.meGusta?.usuarios.includes(user?._id || "");
              return (
                <div
                  key={post._id}
                  onClick={() => router.push(`/posts/${post._id}`)}
                  className="cursor-pointer bg-[#1f2937] text-white rounded-2xl p-4 shadow-md space-y-3 transition-transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl active:scale-95"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/posts/${post._id}`)}
                >
                  {post.imagenes?.[0] && (
                    <img
                      src={`${API_URL}${post.imagenes[0]}`}
                      alt={post.titulo}
                      className="w-full h-64 object-cover rounded"
                    />
                  )}

                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold truncate w-4/5">{post.titulo}</h2>
                    <Tooltip title={yaDioLike ? "Quitar saludo vikingo" : "Enviar saludo vikingo"} arrow TransitionComponent={Zoom}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post._id);
                        }}
                        sx={{ color: yaDioLike ? amarillo : "white", transition: "transform 0.2s ease" }}
                      >
                        {yaDioLike ? <FavoriteIcon sx={{ "&:hover": { transform: "scale(1.2)" } }} /> : <FavoriteBorderIcon sx={{ "&:hover": { transform: "scale(1.2)" } }} />}
                      </IconButton>
                    </Tooltip>
                  </div>

                  <Typography sx={{ mb: 1 }}>{post.contenido}</Typography>
                  <Typography variant="caption" color="gray">@{post.usuario?.username}</Typography>
                  <p className="text-sm text-amber-300">💛 {post.reacciones?.meGusta?.count ?? 0} saludos vikingos</p>
                </div>
              );
            })}
        </div>
      </Container>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 10, p: 3, bgcolor: "#1f2937", borderRadius: 3 }}>
          <Typography color={amarillo} variant="h6" mb={2}>📝 Nuevo Post</Typography>
          <TextField
            label="Título"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            sx={{ mb: 2, input: { color: "white" }, label: { color: "#bbb" } }}
          />
          <TextField
            label="Contenido"
            fullWidth
            multiline
            rows={3}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            sx={{ mb: 2, textarea: { color: "white" }, label: { color: "#bbb" } }}
          />
          <Button
            component="label"
            fullWidth
            variant="outlined"
            sx={{ color: amarillo, borderColor: amarillo, "&:hover": { bgcolor: amarillo, color: "#000" } }}
          >
            Subir Imagen
            <input type="file" hidden accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
          </Button>
          {preview && (
            <Box mt={2}>
              <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 8 }} />
            </Box>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, bgcolor: amarillo, color: "black", fontWeight: "bold" }}
            onClick={handleSubmit}
          >
            Crear Post
          </Button>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
}
