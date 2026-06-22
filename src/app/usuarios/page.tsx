"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/constants";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Container,
  Chip,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SpaIcon from "@mui/icons-material/Spa";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import { SidebarWidget } from "@/components/ui/SidebarWidget";

const tipoColor: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
  legendario: { bg: "var(--color-amber-primary)", icon: EmojiEventsIcon, label: "LEGENDARIO" },
  activo: { bg: "var(--color-emerald)", icon: FlashOnIcon, label: "ACTIVO" },
  nuevo: { bg: "var(--color-info)", icon: SpaIcon, label: "NUEVO" },
  default: { bg: "var(--color-text-muted)", icon: SpaIcon, label: "DESCONOCIDO" },
};

const planConfig: Record<string, { bg: string; label: string; icon: string }> = {
  pro: { bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", label: "PRO MEMBER", icon: "💎" },
  explorer: { bg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", label: "EXPLORER", icon: "🧭" },
  lupuloso: { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", label: "LUPULOSO", icon: "🌿" },
  free: { bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", label: "MIEMBRO", icon: "🍺" },
  default: { bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", label: "MIEMBRO", icon: "🍺" },
};

const podiumStyles: Record<number, {
  color: string;
  glow: string;
  scale: number;
  label: string;
  rank: number;
  icon: string;
}> = {
  0: { color: "#ffd700", glow: "rgba(255, 215, 0, 0.4)", scale: 1.05, label: "Rey del Lúpulo", rank: 1, icon: "🥇" }, // 1st Place
  1: { color: "#c0c0c0", glow: "rgba(192, 192, 192, 0.3)", scale: 0.98, label: "Maestro Cervecero", rank: 2, icon: "🥈" }, // 2nd Place
  2: { color: "#cd7f32", glow: "rgba(205, 127, 50, 0.3)", scale: 0.94, label: "Explorador Activo", rank: 3, icon: "🥉" }, // 3rd Place
};

interface Usuario {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
  tipo?: string;
  followers?: string[];
  following?: string[];
  beersCreated?: string[];
  plan?: string;
  reputation?: number;
  role?: string;
  favoriteStyle?: string;
  city?: string;
  country?: string;
  createdAt?: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [estiloFiltro, setEstiloFiltro] = useState("todos");
  const [planFiltro, setPlanFiltro] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("reputacion");
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  // Helper values
  const getUserId = (u?: Usuario | null) => u?._id || u?.id || "";

  const getTipo = (user: Usuario) => {
    const followersCount = user.followers?.length || 0;
    const beersCount = user.beersCreated?.length || 0;
    if (followersCount >= 5 || user.plan === "pro" || user.role === "owner" || user.plan === "explorer") {
      return "legendario";
    }
    if (beersCount >= 1 || user.plan === "lupuloso" || followersCount >= 2) {
      return "activo";
    }
    return "nuevo";
  };

  const getReputation = (user: Usuario) => {
    const followersCount = user.followers?.length || 0;
    const beersCount = user.beersCreated?.length || 0;
    const isOwner = user.role === "owner";
    
    const base = user.plan === "pro" ? 100 : user.plan === "explorer" ? 60 : user.plan === "lupuloso" ? 40 : 10;
    const ownerBonus = isOwner ? 250 : 0;
    return base + ownerBonus + (followersCount * 15) + (beersCount * 25);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUsuarioActual(userObj);
        
        // Fetch followings
        const fetchFollowing = async () => {
          try {
            const res = await api.get(`/follow/${userObj._id || userObj.id}/following`);
            const data = res.data?.data || [];
            setFollowingIds(data.map((u: any) => u._id || u.id));
          } catch (error) {
            console.error("❌ Error al obtener seguidos:", error);
          }
        };
        fetchFollowing();
      } catch (error) {
        console.error("❌ Error al parsear user desde localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get(`/user?scope=public`);
        const base = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : res.data.usuarios || [];
        
        setUsuarios(base);
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let filtrados = [...usuarios];

    // Búsqueda por username
    if (search.trim()) {
      const q = search.toLowerCase();
      filtrados = filtrados.filter((u) => u.username.toLowerCase().includes(q));
    }

    // Filtrar por estilo de cerveza favorita
    if (estiloFiltro !== "todos") {
      filtrados = filtrados.filter((u) => u.favoriteStyle && u.favoriteStyle.toLowerCase() === estiloFiltro.toLowerCase());
    }

    // Filtrar por plan de suscripción
    if (planFiltro !== "todos") {
      filtrados = filtrados.filter((u) => u.plan && u.plan.toLowerCase() === planFiltro.toLowerCase());
    }

    // Ordenación
    filtrados.sort((a, b) => {
      if (ordenarPor === "reputacion") {
        return getReputation(b) - getReputation(a);
      }
      if (ordenarPor === "seguidores") {
        return (b.followers?.length || 0) - (a.followers?.length || 0);
      }
      if (ordenarPor === "cervezas") {
        return (b.beersCreated?.length || 0) - (a.beersCreated?.length || 0);
      }
      if (ordenarPor === "nuevos") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    setUsuariosFiltrados(filtrados);
  }, [usuarios, search, estiloFiltro, planFiltro, ordenarPor]);

  const handleFollowToggle = async (targetUser: Usuario) => {
    const targetId = targetUser._id || targetUser.id;
    if (!targetId) return;

    const currentId = getUserId(usuarioActual);
    if (!currentId) {
      alert("Por favor inicia sesión para seguir a otros usuarios. 🍺");
      return;
    }

    if (targetId === currentId) {
      alert("¡No puedes seguirte a ti mismo! 😊");
      return;
    }

    const isFollowing = followingIds.includes(targetId);
    
    // Optimistic UI updates
    if (isFollowing) {
      setFollowingIds((prev) => prev.filter((id) => id !== targetId));
    } else {
      setFollowingIds((prev) => [...prev, targetId]);
    }

    // Dynamic followers count update locally
    setUsuarios((prevUsers) =>
      prevUsers.map((u) => {
        if (getUserId(u) === targetId) {
          const currentFollowers = u.followers || [];
          const updatedFollowers = isFollowing
            ? currentFollowers.filter((fid) => fid !== currentId)
            : [...currentFollowers, currentId];
          return { ...u, followers: updatedFollowers };
        }
        return u;
      })
    );

    try {
      if (isFollowing) {
        await api.post(`/follow/${targetId}/unfollow`, {});
      } else {
        await api.post(`/follow/${targetId}/follow`, {});
      }
    } catch (error) {
      console.error("❌ Error toggling follow:", error);
      
      // Revert optimistic updates on error
      if (isFollowing) {
        setFollowingIds((prev) => [...prev, targetId]);
      } else {
        setFollowingIds((prev) => prev.filter((id) => id !== targetId));
      }
      
      setUsuarios((prevUsers) =>
        prevUsers.map((u) => {
          if (getUserId(u) === targetId) {
            const currentFollowers = u.followers || [];
            const revertedFollowers = isFollowing
              ? [...currentFollowers, currentId]
              : currentFollowers.filter((fid) => fid !== currentId);
            return { ...u, followers: revertedFollowers };
          }
          return u;
        })
      );
    }
  };

  const getFotoPerfil = (user: Usuario): string | undefined => {
    const currentId = getUserId(usuarioActual);
    const effectiveUser = getUserId(user) === currentId ? usuarioActual || user : user;
    const path =
      effectiveUser?.profilePicture || effectiveUser?.fotoPerfil || effectiveUser?.photo || "";

    if (!path) return undefined;
    const fixedPath = path.startsWith("./") ? path.replace("./", "/") : path;
    return getImageUrl(fixedPath);
  };

  // Top 3 Leaderboard Users
  const top3Lupuleros = [...usuarios]
    .sort((a, b) => getReputation(b) - getReputation(a))
    .slice(0, 3);

  // Layout Top 3 as [2nd, 1st, 3rd] for the podium visual
  const podiumUsers =
    top3Lupuleros.length === 3
      ? [top3Lupuleros[1], top3Lupuleros[0], top3Lupuleros[2]]
      : top3Lupuleros;

  const filterWidget = (
    <SidebarWidget label="Filtrar Lupuleros">
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {/* Buscador de Nombre */}
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.2)",
            borderRadius: 3,
            "& fieldset": { border: "1px solid rgba(255,255,255,0.1)" },
            "&:hover fieldset": { borderColor: "var(--color-amber-primary)" },
            "&.Mui-focused fieldset": { borderColor: "var(--color-amber-primary)" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "var(--color-text-muted)" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Estilo Favorito */}
        <FormControl fullWidth variant="outlined">
          <InputLabel id="estilo-label" sx={{ color: "var(--color-text-muted)" }}>Estilo Favorito</InputLabel>
          <Select
            labelId="estilo-label"
            value={estiloFiltro}
            onChange={(e) => setEstiloFiltro(e.target.value)}
            label="Estilo Favorito"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.2)",
              borderRadius: 3,
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
            }}
          >
            <MenuItem value="todos">Todos los estilos</MenuItem>
            <MenuItem value="ipa">IPA 🌿</MenuItem>
            <MenuItem value="stout">Stout 🍫</MenuItem>
            <MenuItem value="lager">Lager 🍺</MenuItem>
            <MenuItem value="amber ale">Amber Ale 🍯</MenuItem>
            <MenuItem value="pilsner">Pilsner 🍋</MenuItem>
            <MenuItem value="sour">Sour 🍓</MenuItem>
            <MenuItem value="pale ale">Pale Ale 🍞</MenuItem>
            <MenuItem value="belgian tripel">Belgian Tripel 🇧🇪</MenuItem>
            <MenuItem value="golden ale">Golden Ale 🍯</MenuItem>
            <MenuItem value="west coast ipa">West Coast IPA 🌲</MenuItem>
            <MenuItem value="hazy ipa">Hazy IPA 🌫️</MenuItem>
          </Select>
        </FormControl>

        {/* Nivel de Plan */}
        <FormControl fullWidth variant="outlined">
          <InputLabel id="plan-label" sx={{ color: "var(--color-text-muted)" }}>Nivel Plan</InputLabel>
          <Select
            labelId="plan-label"
            value={planFiltro}
            onChange={(e) => setPlanFiltro(e.target.value)}
            label="Nivel Plan"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.2)",
              borderRadius: 3,
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
            }}
          >
            <MenuItem value="todos">Todos los planes</MenuItem>
            <MenuItem value="pro">Pro Member 💎</MenuItem>
            <MenuItem value="explorer">Explorer 🧭</MenuItem>
            <MenuItem value="lupuloso">Lupuloso 🌿</MenuItem>
            <MenuItem value="free">Miembro Gratuito 🍺</MenuItem>
          </Select>
        </FormControl>

        {/* Ordenar por */}
        <FormControl fullWidth variant="outlined">
          <InputLabel id="orden-label" sx={{ color: "var(--color-text-muted)" }}>Ordenar por</InputLabel>
          <Select
            labelId="orden-label"
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            label="Ordenar por"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.2)",
              borderRadius: 3,
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-amber-primary)" },
            }}
          >
            <MenuItem value="reputacion">Mayor Reputación ⭐</MenuItem>
            <MenuItem value="seguidores">Más Seguidores 👥</MenuItem>
            <MenuItem value="cervezas">Más Cervezas Creadas 🍺</MenuItem>
            <MenuItem value="nuevos">Más Recientes 📅</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </SidebarWidget>
  );

  return (
    <MainLayout
      tightWidth={true}
      title="Usuarios"
      titleGradientText="conectados."
      titleGradient="var(--gradient-heading)"
      subtitle="Conecta con otros cerveceros, sigue a los expertos y haz crecer tu reputación lupulera. ¡El lúpulo nos une!"
      sidebar={filterWidget}
    >
      <style>{`
        @keyframes bounceRank {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
      
      <div className="relative z-[2] mx-auto w-full flex-1 pb-12">
        {/* PODIO DE LÍDERES (Solo visible si no se está buscando ni aplicando filtros) */}
        {!search && estiloFiltro === "todos" && planFiltro === "todos" && top3Lupuleros.length >= 3 && (
          <Box mb={5}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🔥 Top Lupuleros Destacados
            </Typography>

            <Stack spacing={2} sx={{ width: "100%", mb: 5 }}>
              {top3Lupuleros.map((user, index) => {
                const styleInfo = podiumStyles[index] || podiumStyles[2];
                const plan = user.plan?.toLowerCase() || "free";
                const pc = planConfig[plan] || planConfig.free;

                return (
                  <Box
                    key={user._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(28, 24, 20, 0.7)",
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${styleInfo.color}`,
                      borderRadius: 4,
                      p: 2,
                      px: 2.5,
                      boxShadow: `0 4px 15px ${styleInfo.glow}`,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateX(4px)",
                        boxShadow: `0 4px 20px ${styleInfo.color}40`,
                      },
                    }}
                  >
                    {/* Podium Rank Icon */}
                    <Typography
                      sx={{
                        fontSize: "2rem",
                        mr: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      {styleInfo.icon}
                    </Typography>

                    {/* Avatar */}
                    <Avatar
                      src={getFotoPerfil(user)}
                      alt={user.username}
                      sx={{
                        width: 52,
                        height: 52,
                        border: `2px solid ${styleInfo.color}`,
                        boxShadow: `0 0 10px ${styleInfo.glow}`,
                        mr: 2,
                      }}
                    >
                      {!getFotoPerfil(user) && user.username.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Username, Title & Verified */}
                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            color: "#fff",
                            fontSize: "1rem",
                          }}
                          noWrap
                        >
                          {user.username}
                        </Typography>
                        {getTipo(user) === "legendario" && (
                          <VerifiedIcon sx={{ color: "var(--color-amber-primary)", fontSize: 16 }} />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color: styleInfo.color,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontSize: "0.68rem",
                        }}
                      >
                        {styleInfo.label}
                      </Typography>
                    </Box>

                    {/* Reputation Score */}
                    <Box sx={{ textAlign: "right", mr: 3, shrink: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#ffd700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        ⭐ {getReputation(user)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.68rem" }}>
                        Reputación
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={1} sx={{ shrink: 0 }}>
                      {getUserId(user) !== getUserId(usuarioActual) ? (
                        <IconButton
                          onClick={() => handleFollowToggle(user)}
                          sx={{
                            color: followingIds.includes(getUserId(user)) ? "var(--color-emerald)" : "var(--color-amber-primary)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 2.5,
                            p: 1,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.05)",
                            }
                          }}
                          aria-label={followingIds.includes(getUserId(user)) ? "Dejar de seguir" : "Seguir"}
                        >
                          {followingIds.includes(getUserId(user)) ? (
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <PersonAddIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      ) : (
                        <Chip
                          label="Tú"
                          size="small"
                          sx={{
                            color: "var(--color-text-muted)",
                            bgcolor: "rgba(255,255,255,0.05)",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            px: 0.5,
                            height: 28,
                            alignSelf: "center",
                          }}
                        />
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.15)",
                          borderRadius: 2.5,
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          textTransform: "none",
                          "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                        }}
                        onClick={() => router.push(`/usuarios/${user._id}`)}
                      >
                        Ver
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* FILTROS EN MOBILE (Se oculta en Desktop / xl) */}
        <Box sx={{ display: { xs: "block", xl: "none" }, mb: 4 }}>
          {filterWidget}
        </Box>

        {loading ? (
          <Box textAlign="center" py={10}>
            <CircularProgress color="warning" size={50} />
            <Typography variant="body1" sx={{ color: "var(--color-text-muted)", mt: 2 }}>
              Descubriendo lupuleros...
            </Typography>
          </Box>
        ) : (
          <>
            {usuariosFiltrados.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  bgcolor: "rgba(28, 24, 20, 0.3)",
                  borderRadius: 5,
                  border: "1.5px dashed rgba(255,255,255,0.08)",
                }}
              >
                <SportsBarIcon sx={{ fontSize: 64, color: "var(--color-text-muted)", mb: 2 }} />
                <Typography variant="h6" color="#fff" fontWeight="bold">
                  No se encontraron lupuleros
                </Typography>
                <Typography variant="body2" color="var(--color-text-muted)" sx={{ mt: 0.5 }}>
                  Prueba cambiando los filtros o tu búsqueda para ver más resultados.
                </Typography>
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "1fr",
                  sm: "1fr 1fr",
                }}
                gap={3}
              >
                {usuariosFiltrados.map((user) => {
                  const tipo = getTipo(user);
                  const estilo = tipoColor[tipo] || tipoColor.default;
                  const Icono = estilo.icon;
                  const plan = user.plan?.toLowerCase() || "free";
                  const pc = planConfig[plan] || planConfig.free;

                  return (
                    <Box
                      key={user._id}
                      sx={{
                        position: "relative",
                        backgroundColor: "rgba(28, 24, 20, 0.55)",
                        backdropFilter: "blur(12px)",
                        borderRadius: 5,
                        p: 3,
                        pt: 6, // space for top banner strip
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: `0 12px 25px ${estilo.bg}22`,
                          borderColor: estilo.bg,
                        },
                      }}
                    >
                      {/* Top Banner Strip */}
                      <Box
                        sx={{
                          height: 52,
                          width: "100%",
                          background: pc.bg,
                          position: "absolute",
                          top: 0,
                          left: 0,
                          opacity: 0.75,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      />

                      {/* Avatar with dynamic ring */}
                      <Avatar
                        src={getFotoPerfil(user)}
                        alt={user.username}
                        sx={{
                          bgcolor: estilo.bg,
                          width: 80,
                          height: 80,
                          fontSize: 30,
                          fontWeight: "bold",
                          mb: 1.5,
                          zIndex: 1,
                          border: "4px solid #1c1814",
                          boxShadow: `0 0 15px ${estilo.bg}80`,
                        }}
                      >
                        {!getFotoPerfil(user) && user.username.charAt(0).toUpperCase()}
                      </Avatar>

                      {/* Plan Badge inside Card */}
                      <Chip
                        icon={<span>{pc.icon}</span>}
                        label={pc.label}
                        size="small"
                        sx={{
                          background: "rgba(0,0,0,0.4)",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "0.68rem",
                          border: "1px solid rgba(255,255,255,0.1)",
                          height: 22,
                          mb: 1.5,
                          zIndex: 1,
                        }}
                      />

                      {/* Username */}
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            transition: "color 0.2s",
                            "&:hover": { color: "var(--color-amber-primary)" },
                          }}
                          onClick={() => router.push(`/usuarios/${user._id}`)}
                        >
                          {user.username}
                        </Typography>
                        {tipo === "legendario" && (
                          <VerifiedIcon sx={{ color: "var(--color-amber-primary)", fontSize: 16 }} />
                        )}
                      </Stack>

                      {/* City & Country */}
                      {user.city ? (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <LocationOnIcon sx={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                          <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                            {user.city}, {user.country || "Chile"}
                          </Typography>
                        </Stack>
                      ) : (
                        <Box sx={{ height: 21, mb: 1.5 }} />
                      )}

                      {/* Favorite Style */}
                      {user.favoriteStyle ? (
                        <Chip
                          size="small"
                          icon={<SportsBarIcon sx={{ fontSize: 11 }} />}
                          label={`Fav: ${user.favoriteStyle}`}
                          sx={{
                            bgcolor: "rgba(251, 191, 36, 0.06)",
                            color: "var(--color-amber-primary)",
                            border: "1px solid rgba(251, 191, 36, 0.15)",
                            fontWeight: "bold",
                            fontSize: "0.72rem",
                            mb: 2,
                          }}
                        />
                      ) : (
                        <Box sx={{ height: 24, mb: 2 }} />
                      )}

                      {/* Stats Row */}
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          width: "100%",
                          py: 1.5,
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          mb: 2.5,
                        }}
                        justifyContent="space-around"
                      >
                        <Box textAlign="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>
                            {user.followers?.length || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>
                            Seguidores
                          </Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>
                            {user.beersCreated?.length || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>
                            Cervezas
                          </Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#ffd700", fontSize: "0.9rem" }}>
                            {getReputation(user)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>
                            Reputación
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Action buttons */}
                      <Stack direction="row" spacing={1} width="100%" sx={{ mt: "auto" }}>
                        {getUserId(user) !== getUserId(usuarioActual) ? (
                          <Button
                            fullWidth
                            variant={followingIds.includes(getUserId(user)) ? "outlined" : "contained"}
                            size="small"
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.78rem",
                              borderRadius: 2,
                              textTransform: "none",
                              bgcolor: followingIds.includes(getUserId(user)) ? "transparent" : estilo.bg,
                              color: followingIds.includes(getUserId(user)) ? estilo.bg : "#000",
                              borderColor: followingIds.includes(getUserId(user)) ? estilo.bg : "none",
                              "&:hover": {
                                bgcolor: followingIds.includes(getUserId(user)) ? "rgba(255,255,255,0.05)" : "var(--color-amber-light)",
                                borderColor: followingIds.includes(getUserId(user)) ? estilo.bg : "none",
                              }
                            }}
                            onClick={() => handleFollowToggle(user)}
                          >
                            {followingIds.includes(getUserId(user)) ? "Siguiendo" : "Seguir"}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.78rem",
                              borderRadius: 2,
                              textTransform: "none",
                              color: "var(--color-text-muted) !important",
                              borderColor: "rgba(255,255,255,0.1) !important",
                            }}
                          >
                            Tú
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.15)",
                            borderRadius: 2,
                            fontSize: "0.78rem",
                            fontWeight: "bold",
                            textTransform: "none",
                            "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                          }}
                          onClick={() => router.push(`/usuarios/${user._id}`)}
                        >
                          Ver
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </div>

      <Footer />
    </MainLayout>
  );
}
