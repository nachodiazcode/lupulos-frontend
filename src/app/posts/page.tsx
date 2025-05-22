// "use client" para Next.js 13+
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, Container, Stack, Modal,
  IconButton, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";
const amarillo = "#fbbf24";

interface Usuario {
  _id: string;
  username: string;
  fotoPerfil?: string;
}

interface Comentario {
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

export default function PostPage() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [comentariosCargados, setComentariosCargados] = useState<Record<string, Comentario[]>>({});
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

  const handleLike = async (postId: string) => {
    if (!user?._id) return;
    try {
      await axios.post(`${API_URL}/api/post/${postId}/like`, {
        tipo: "meGusta",
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al dar like:", err);
    }
  };

  const enviarComentario = async (postId: string) => {
    if (!comentarios[postId] || !user?._id) return;
    try {
      await axios.post(`${API_URL}/api/post/${postId}/comentario`, {
        contenido: comentarios[postId],
        usuarioId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setComentarios(prev => ({ ...prev, [postId]: "" }));
      verComentarios(postId);
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const verComentarios = async (postId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/post/${postId}/comentarios`);
      setComentariosCargados(prev => ({ ...prev, [postId]: res.data.comentarios }));
    } catch (err) {
      console.error("❌ Error al cargar comentarios:", err);
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
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to bottom, #1f2937, #111827)", color: "white", display: "flex", flexDirection: "column" }}>
      <GoldenBackground />
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{  px: 2, flex: 1, pb: 10 }}
      >
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
                <div key={post._id} className="bg-[#1f2937] p-4 rounded-2xl text-white space-y-3">
                  {post.imagenes?.[0] && <img src={`${API_URL}${post.imagenes[0]}`} className="w-full h-auto rounded" alt={post.titulo} />}
                  <h2 className="text-lg font-bold text-yellow-400">{post.titulo}</h2>
                  <p>{post.contenido}</p>
                  <p className="text-xs text-gray-400">@{post.usuario?.username}</p>
                  <div className="flex items-center gap-2">
                    <IconButton onClick={() => yaDioLike ? null : handleLike(post._id)} size="small" sx={{ color: amarillo }}>{yaDioLike ? "💔" : "❤️"}</IconButton>
                    <span>{post.reacciones?.meGusta?.count ?? 0}</span>
                  </div>
                  <Button size="small" onClick={() => verComentarios(post._id)} sx={{ color: amarillo }}>Ver comentarios</Button>
                  {comentariosCargados[post._id]?.map((c, i) => (
                    <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                      <img src={c.usuario?.fotoPerfil || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover" alt={c.usuario?.username} />
                      <Box>
                        <Typography fontWeight="bold">{c.usuario?.username}</Typography>
                        <Typography variant="body2" color="gray">{c.comentario}</Typography>
                      </Box>
                    </Stack>
                  ))}
                  <TextField
                    fullWidth
                    placeholder="Escribe tu comentario"
                    value={comentarios[post._id] || ""}
                    onChange={(e) => setComentarios(prev => ({ ...prev, [post._id]: e.target.value }))}
                    sx={{ mt: 2, bgcolor: "#111827", input: { color: "white" }, borderRadius: 1 }}
                  />
                  <Button fullWidth variant="contained" sx={{ mt: 1, bgcolor: amarillo, color: "black" }} onClick={() => enviarComentario(post._id)}>Comentar 💬</Button>
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
