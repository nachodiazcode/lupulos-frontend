"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Stack,
  Modal,
  CircularProgress,
  IconButton,
  Tooltip,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoldenBackground from "@/components/GoldenBackground";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/navigation";

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
  createdAt?: string;
  updatedAt?: string;
  reacciones?: {
    meGusta?: { count: number; usuarios: string[] };
  };
  reactions?: {
    like?: { count: number; users: string[] };
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
  const [filtroAutor, setFiltroAutor] = useState("");
  const [minLikes, setMinLikes] = useState<number>(0);
  const [soloConImagen, setSoloConImagen] = useState(false);
  const [orden, setOrden] = useState<"recientes" | "antiguos" | "likes">("recientes");

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
      const res = await api.get(`/post`);
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.posts || [];
      setPosts(data);
    } catch (err) {
      console.error("❌ Error al obtener posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    const userId = getUserId(user);
    if (!userId) return;

    try {
      await api.post(`/post/${postId}/react`, {
        type: "meGusta",
      });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error al alternar like:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserId(user);
    if (!userId) return;
    try {
      let imagePath = "";
      if (imagen) {
        const formData = new FormData();
        formData.append("imagen", imagen);
        const res = await api.post(`/post/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePath = res.data.path;
      }
      await api.post(`/post`, {
        titulo,
        contenido,
        imagenes: imagePath ? [imagePath] : [],
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
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}
      >
        <CircularProgress sx={{ color: amarillo }} />
      </Box>
    );
  }

  const postsFiltrados = posts
    .filter((p) => {
      const q = normalizeText(filtro);
      const qAutor = normalizeText(filtroAutor);

      const title = normalizeText(getPostTitle(p));
      const content = normalizeText(getPostContent(p));
      const author = normalizeText(getPostUser(p)?.username || "");
      const likes = getLikeCount(p);
      const hasImage = !!getPostImages(p)[0];

      const matchesText = !q || title.includes(q) || content.includes(q) || author.includes(q);
      const matchesAuthor = !qAutor || author.includes(qAutor);
      const matchesLikes = likes >= Number(minLikes || 0);
      const matchesImage = !soloConImagen || hasImage;

      return matchesText && matchesAuthor && matchesLikes && matchesImage;
    })
    .sort((a, b) => {
      if (orden === "likes") return getLikeCount(b) - getLikeCount(a);
      const aDate = new Date(getPostDate(a)).getTime();
      const bDate = new Date(getPostDate(b)).getTime();
      if (orden === "antiguos") return aDate - bDate;
      return bDate - aDate;
    });

  return (
    <Box sx={{ minHeight: "100vh", color: "white", display: "flex", flexDirection: "column" }}>
      <GoldenBackground />
      <Navbar />

      <Container maxWidth="lg" sx={{ px: 2, flex: 1, pb: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h5" fontWeight="bold">
            📢 Comunidad cervecera
          </Typography>
          <Button
            onClick={() => setModalAbierto(true)}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: amarillo, color: "#000", fontWeight: "bold" }}
          >
            SUBIR POST
          </Button>
        </Stack>

        <TextField
          fullWidth
          placeholder="🔍 Buscar por título o contenido..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{
            mb: 6,
            bgcolor: "var(--color-surface-card)",
            borderRadius: 2,
            input: { color: "white" },
          }}
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 5 }}>
          <TextField
            fullWidth
            placeholder="👤 Filtrar por autor"
            value={filtroAutor}
            onChange={(e) => setFiltroAutor(e.target.value)}
            sx={{
              bgcolor: "var(--color-surface-card)",
              borderRadius: 2,
              input: { color: "white" },
            }}
          />
          <TextField
            type="number"
            label="💛 Mínimo saludos"
            value={minLikes}
            onChange={(e) => setMinLikes(Math.max(0, Number(e.target.value || 0)))}
            sx={{
              minWidth: { md: 200 },
              bgcolor: "var(--color-surface-card)",
              borderRadius: 2,
              input: { color: "white" },
              label: { color: "#bbb" },
            }}
          />
          <FormControl
            sx={{
              minWidth: { md: 220 },
              bgcolor: "var(--color-surface-card)",
              borderRadius: 2,
            }}
          >
            <InputLabel id="orden-posts-label">Orden</InputLabel>
            <Select
              labelId="orden-posts-label"
              value={orden}
              label="Orden"
              onChange={(e) => setOrden(e.target.value as "recientes" | "antiguos" | "likes")}
              sx={{ color: "white" }}
            >
              <MenuItem value="recientes">Más recientes</MenuItem>
              <MenuItem value="antiguos">Más antiguos</MenuItem>
              <MenuItem value="likes">Más saludados</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={soloConImagen}
                onChange={(e) => setSoloConImagen(e.target.checked)}
                color="warning"
              />
            }
            label="Solo con imagen"
            sx={{ whiteSpace: "nowrap" }}
          />
        </Stack>

        {postsFiltrados.length === 0 ? (
          <Typography textAlign="center" sx={{ color: amarillo, fontSize: "1.2rem" }}>
            😢 Aún no has subido ningún artículo. ¡Comparte tu historia cervecera y anima esta
            comunidad! 🍺
          </Typography>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postsFiltrados.map((post) => {
              const yaDioLike = getLikeUsers(post).includes(getUserId(user));
              return (
                <div
                  key={getPostId(post)}
                  onClick={() => router.push(`/posts/${getPostId(post)}`)}
                  className="bg-surface-card cursor-pointer space-y-3 rounded-2xl p-4 text-white shadow-md transition-transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl active:scale-95"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/posts/${getPostId(post)}`)}
                >
                  {getPostImages(post)[0] && (
                    <Image
                      src={getImageUrl(getPostImages(post)[0])}
                      unoptimized
                      alt={getPostTitle(post)}
                      className="h-64 w-full rounded object-cover"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <h2 className="w-4/5 truncate text-lg font-semibold">{getPostTitle(post)}</h2>
                    <Tooltip
                      title={yaDioLike ? "Quitar saludo vikingo" : "Enviar saludo vikingo"}
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(getPostId(post));
                        }}
                        sx={{
                          color: yaDioLike ? amarillo : "white",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        {yaDioLike ? (
                          <FavoriteIcon sx={{ "&:hover": { transform: "scale(1.2)" } }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ "&:hover": { transform: "scale(1.2)" } }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>

                  <Typography sx={{ mb: 1 }}>{getPostContent(post)}</Typography>
                  <Typography variant="caption" color="gray">
                    @{getPostUser(post)?.username}
                  </Typography>
                  <p className="text-sm text-amber-300">💛 {getLikeCount(post)} saludos vikingos</p>
                </div>
              );
            })}
          </div>
        )}
      </Container>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
        <Box
          sx={{
            maxWidth: 500,
            mx: "auto",
            mt: 10,
            p: 3,
            bgcolor: "var(--color-surface-card)",
            borderRadius: 3,
          }}
        >
          <Typography color={amarillo} variant="h6" mb={2}>
            📝 Nuevo Post
          </Typography>
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
            sx={{
              color: amarillo,
              borderColor: amarillo,
              "&:hover": { bgcolor: amarillo, color: "#000" },
            }}
          >
            Subir Imagen
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImagen(e.target.files?.[0] || null)}
            />
          </Button>
          {preview && (
            <Box mt={2}>
              <Image src={preview} alt="preview" style={{ width: "100%", borderRadius: 8 }} />
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

function getPostId(post: Post): string {
  return post._id || post.id || "";
}
function getPostTitle(post: Post): string {
  return post.titulo || post.title || "";
}
function getPostContent(post: Post): string {
  return post.contenido || post.content || "";
}
function getPostImages(post: Post): string[] {
  return post.imagenes || post.images || [];
}
function getPostUser(post: Post): Usuario | undefined {
  return post.usuario || post.author;
}
function getUserId(user?: Usuario | null): string {
  return user?._id || user?.id || "";
}
function getLikeUsers(post?: Post): string[] {
  return post?.reacciones?.meGusta?.usuarios || post?.reactions?.like?.users || [];
}
function getLikeCount(post: Post): number {
  return (
    post.reacciones?.meGusta?.count ?? post.reactions?.like?.count ?? getLikeUsers(post).length ?? 0
  );
}
function getPostDate(post: Post): string {
  return post.createdAt ?? post.updatedAt ?? "";
}
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
