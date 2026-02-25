// ✅ PostDetailPage.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  TextField,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Zoom,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
const amarillo = "var(--color-amber-primary)";

interface Usuario {
  _id?: string;
  id?: string;
  username?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
}

interface Comentario {
  _id?: string;
  comentario?: string;
  content?: string;
  usuario?: Usuario;
  author?: Usuario;
}

interface Post {
  _id?: string;
  id?: string;
  titulo?: string;
  title?: string;
  contenido?: string;
  content?: string;
  imagenes?: string[];
  images?: string[];
  usuario?: Usuario;
  author?: Usuario;
  reacciones?: {
    meGusta?: { count: number; usuarios: string[] };
  };
  reactions?: {
    like?: { count: number; users: string[] };
  };
}

export default function PostDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Usuario | null>(null);
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tituloEditado, setTituloEditado] = useState("");
  const [contenidoEditado, setContenidoEditado] = useState("");

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      const res = await api.get(`/post/${id}`);
      const data = res.data?.data || res.data?.post;
      setPost(data);
      setTituloEditado(getPostTitle(data));
      setContenidoEditado(getPostContent(data));
    } catch (err) {
      console.error("❌ Error al cargar post:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComentarios = useCallback(async () => {
    try {
      const res = await api.get(`/post/${id}/comentarios`);
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.comentarios || [];
      setComentarios(data);
    } catch (err) {
      console.error("❌ Error al cargar comentarios:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComentarios();
    }
  }, [id, fetchPost, fetchComentarios]);

  if (!isClient || loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ background: "var(--color-surface-card-alt)" }}
      >
        <CircularProgress sx={{ color: amarillo }} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="var(--color-surface-card-alt)"
      >
        <Typography color="error" fontSize="1.2rem">
          😵‍💫 No encontramos este post. Puede que haya sido eliminado.
        </Typography>
      </Box>
    );
  }

  const yaDioLike = getLikeUsers(post).includes(getUserId(user));
  const esAutor = getUserId(getPostUser(post)) === getUserId(user);

  const toggleLike = async () => {
    if (!getUserId(user) || !post) return;

    try {
      await api.post(`/post/${id}/react`, { type: "meGusta" });
      fetchPost();
    } catch (err) {
      console.error("❌ Error al alternar like:", err);
    }
  };

  const enviarComentario = async () => {
    if (!comentario.trim() || !getUserId(user)) return;
    try {
      await api.post(`/post/${id}/comentario`, { content: comentario });
      setComentario("");
      fetchComentarios();
    } catch (error) {
      console.error("❌ Error al comentar:", error);
    }
  };

  const eliminarPost = async () => {
    if (!window.confirm("¿Estás seguro que quieres eliminar este post?")) return;
    try {
      await api.delete(`/post/${id}`);
      router.push("/posts");
    } catch (error) {
      console.error("❌ Error al eliminar post:", error);
    }
  };

  const guardarCambios = async () => {
    try {
      await api.put(`/post/${id}`, { titulo: tituloEditado, contenido: contenidoEditado });
      setEditMode(false);
      fetchPost();
    } catch (error) {
      console.error("❌ Error al actualizar post:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", color: "white" }}>
      <Navbar />
      <Container sx={{ py: 6 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* 🖼️ COLUMNA IZQUIERDA */}
          <Box flex={3}>
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  label="Título"
                  value={tituloEditado}
                  onChange={(e) => setTituloEditado(e.target.value)}
                  sx={{ mb: 2, input: { color: "white" }, label: { color: "#bbb" } }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Contenido"
                  value={contenidoEditado}
                  onChange={(e) => setContenidoEditado(e.target.value)}
                  sx={{ mb: 2, textarea: { color: "white" }, label: { color: "#bbb" } }}
                />
                <Button
                  variant="contained"
                  onClick={guardarCambios}
                  sx={{ bgcolor: amarillo, color: "black", mr: 2 }}
                >
                  Guardar cambios
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                  sx={{ color: "white", borderColor: "gray" }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  {getPostTitle(post)}
                </Typography>
                {getPostImages(post)[0] && (
                  <Image
                    src={getImageUrl(getPostImages(post)[0])}
                    alt={getPostTitle(post)}
                    width={900}
                    height={500}
                    unoptimized
                    style={{
                      width: "100%",
                      maxHeight: "460px", // 🔼 un poco más grande que antes
                      objectFit: "contain",
                      borderRadius: "1.5rem", // 🔄 curva más elegante (24px)
                      marginBottom: 24,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)", // 🖼️ un leve sombreado moderno
                    }}
                  />
                )}
                <Typography variant="body1" mb={3}>
                  {getPostContent(post)}
                </Typography>
              </>
            )}
          </Box>

          {/* 💬 COLUMNA DERECHA */}
          <Box
            flex={2}
            sx={{ borderLeft: { md: "1px solid #333" }, pl: { md: 3 }, mt: { xs: 4, md: 0 } }}
          >
            <Typography variant="subtitle2" color="gray" mb={2}>
              Publicado por: @{getPostUser(post)?.username}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Tooltip
                title={yaDioLike ? "Quitar saludo vikingo" : "Enviar saludo vikingo"}
                arrow
                TransitionComponent={Zoom}
              >
                <IconButton onClick={toggleLike} sx={{ color: yaDioLike ? amarillo : "white" }}>
                  {yaDioLike ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              <Typography>💛 {getLikeCount(post)} saludos vikingos</Typography>

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

            <Typography variant="h6" mb={2}>
              💬 Comentarios
            </Typography>
            {comentarios.map((c) => (
              <Box
                key={c._id || getCommentText(c)}
                mb={2}
                p={2}
                bgcolor="var(--color-surface-card-alt)"
                borderRadius={2}
              >
                <Typography fontWeight="bold">@{getCommentAuthor(c)?.username}</Typography>
                <Typography variant="body2" color="gray">
                  {getCommentText(c)}
                </Typography>
              </Box>
            ))}

            <TextField
              fullWidth
              placeholder="Escribe tu comentario..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              sx={{
                mt: 2,
                bgcolor: "var(--color-surface-card-alt)",
                input: { color: "white" },
                borderRadius: 1,
              }}
            />
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: amarillo, color: "black" }}
              onClick={enviarComentario}
            >
              Comentar 💬
            </Button>
          </Box>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
}

function getPostTitle(post?: Post | null): string {
  return post?.titulo || post?.title || "";
}
function getPostContent(post?: Post | null): string {
  return post?.contenido || post?.content || "";
}
function getPostImages(post?: Post | null): string[] {
  return post?.imagenes || post?.images || [];
}
function getPostUser(post?: Post | null): Usuario | undefined {
  return post?.usuario || post?.author;
}
function getLikeUsers(post?: Post | null): string[] {
  return post?.reacciones?.meGusta?.usuarios || post?.reactions?.like?.users || [];
}
function getLikeCount(post?: Post | null): number {
  return (
    post?.reacciones?.meGusta?.count ??
    post?.reactions?.like?.count ??
    getLikeUsers(post).length ??
    0
  );
}
function getUserId(u?: Usuario | null): string {
  return u?._id || u?.id || "";
}
function getCommentAuthor(c: Comentario): Usuario | undefined {
  return c.usuario || c.author;
}
function getCommentText(c: Comentario): string {
  return c.comentario || c.content || "";
}
