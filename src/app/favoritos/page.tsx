"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Snackbar, Alert, CircularProgress, Tab, Tabs, Box } from "@mui/material";

import MainLayout from "@/components/layouts/MainLayout";
import BeerCard from "@/components/ui/BeerCard";
import { SidebarWidget } from "@/components/ui/SidebarWidget";
import Footer from "@/components/Footer";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useBeers } from "@/features/beers/hooks/useBeers";
import type { Place } from "@/features/lugares/types";
import { getImageUrl } from "@/lib/constants";

/* ─── On-brand empty state (glass + glow dorado) ─── */
function FavEmptyState({
  icon,
  title,
  detail,
  ctaLabel,
  onCta,
}: {
  icon: string;
  title: string;
  detail: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative overflow-hidden rounded-[1.75rem] border p-10 text-center md:p-14"
      style={{
        background: "linear-gradient(180deg, rgba(251,191,36,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
        boxShadow: "var(--shadow-card)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/5 blur-[80px]" />
      <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {icon}
      </span>
      <h3 className="text-2xl font-extrabold leading-tight text-[var(--color-text-primary)]">{title}</h3>
      <p className="mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">{detail}</p>
      <motion.button
        whileHover={{ scale: 1.03, filter: "brightness(1.08)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onCta}
        className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold"
        style={{ background: "var(--gradient-button-primary)", color: "var(--color-text-dark)", boxShadow: "var(--shadow-amber-glow)" }}
      >
        <span>{ctaLabel}</span>
        <span>→</span>
      </motion.button>
    </motion.div>
  );
}

/* ─── Skeleton grid mientras carga ─── */
function FavSkeletonGrid() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)]"
          style={{ background: "var(--color-surface-card)" }}
        >
          <div className="aspect-[5/3] w-full animate-pulse bg-white/[0.05]" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FavoritosPage() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // --- States for places ---
  const [lugares, setLugares] = useState<Place[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [lugaresLoading, setLugaresLoading] = useState(true);

  // --- Feedback ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("var(--color-amber-primary)");

  // --- Fetch Beers ---
  const { beers: allBeers, isLoading: beersLoading, onToggleLike } = useBeers();

  useEffect(() => {
    setMounted(true);

    // Read favorite places from localStorage
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritosIds(favs);

    // Fetch all places to filter later
    const fetchLugares = async () => {
      setLugaresLoading(true);
      try {
        const res = await api.get(`/location`);
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setLugares(data);
      } catch (error) {
        console.error("❌ Error al obtener lugares para favoritos:", error);
      } finally {
        setLugaresLoading(false);
      }
    };

    fetchLugares();
  }, []);

  // Filter favorite beers (where user has liked)
  const favoritedBeers = useMemo(() => {
    if (!user) return [];
    return allBeers.filter((beer) => beer.likes?.includes((user._id as string) || (user.id as string) || ""));
  }, [allBeers, user]);

  // Filter favorite places (that are in favoritosIds)
  const favoritedPlaces = useMemo(() => {
    return lugares.filter((place) => favoritosIds.includes(place._id));
  }, [lugares, favoritosIds]);

  // "Pasaporte cervecero" — nivel según total de guardados
  const passport = useMemo(() => {
    const total = favoritedBeers.length + favoritedPlaces.length;
    const tiers = [
      { min: 0, icon: "🌱", level: "Aprendiz", cap: 5 },
      { min: 5, icon: "🍺", level: "Catador", cap: 15 },
      { min: 15, icon: "🎖️", level: "Conocedor", cap: 30 },
      { min: 30, icon: "👑", level: "Maestro Cervecero", cap: 30 },
    ];
    const tier = [...tiers].reverse().find((t) => total >= t.min) ?? tiers[0];
    const span = Math.max(1, tier.cap - tier.min);
    const progress = tier.level === "Maestro Cervecero" ? 100 : Math.min(100, ((total - tier.min) / span) * 100);
    const next =
      tier.level === "Maestro Cervecero"
        ? "¡Nivel máximo desbloqueado!"
        : `${Math.max(0, tier.cap - total)} para subir de nivel`;
    return { total, icon: tier.icon, level: tier.level, progress, next };
  }, [favoritedBeers.length, favoritedPlaces.length]);

  // "Tu perfil cervecero" — insights de la colección
  const profile = useMemo(() => {
    const beers = favoritedBeers;
    const places = favoritedPlaces;

    const tally = (items: string[]) => {
      const map = new Map<string, number>();
      items.forEach((raw) => {
        const key = raw?.trim();
        if (key) map.set(key, (map.get(key) ?? 0) + 1);
      });
      return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
    };

    const styles = tally(beers.map((b) => b.style));
    const breweries = tally(beers.map((b) => b.brewery));
    const cities = tally(places.map((p) => p.address?.city ?? ""));

    const abvs = beers.map((b) => b.abv).filter((n) => typeof n === "number" && n > 0);
    const avgAbv = abvs.length ? abvs.reduce((a, b) => a + b, 0) / abvs.length : 0;

    const ratings: number[] = [];
    beers.forEach((b) => { if (b.averageRating) ratings.push(b.averageRating); });
    places.forEach((p) => {
      if (p.reviews?.length) ratings.push(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length);
    });
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const maxStyle = styles[0]?.count ?? 1;
    return {
      styles,
      maxStyle,
      dominantStyle: styles[0]?.name ?? null,
      uniqueStyles: styles.length,
      topBrewery: breweries[0]?.name ?? null,
      topCity: cities[0]?.name ?? null,
      avgAbv,
      avgRating,
    };
  }, [favoritedBeers, favoritedPlaces]);

  const profileTagline = profile.dominantStyle
    ? `Tu lado cervecero se inclina por las ${profile.dominantStyle}${profile.topCity ? ` · base: ${profile.topCity}` : ""}.`
    : profile.topCity
      ? `Andas explorando la escena de ${profile.topCity}.`
      : "Tu colección está tomando forma.";

  const profileTiles = [
    profile.dominantStyle && { icon: "🏆", label: "Estilo dominante", value: profile.dominantStyle },
    profile.uniqueStyles > 0 && { icon: "🎨", label: "Estilos distintos", value: String(profile.uniqueStyles) },
    profile.topBrewery && { icon: "🏭", label: "Cervecería top", value: profile.topBrewery },
    profile.topCity && { icon: "📍", label: "Ciudad top", value: profile.topCity },
    profile.avgAbv > 0 && { icon: "🌡️", label: "ABV promedio", value: `${profile.avgAbv.toFixed(1)}%` },
    profile.avgRating > 0 && { icon: "⭐", label: "Rating promedio", value: profile.avgRating.toFixed(1) },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  // Handle Beer Like toggle
  const handleToggleBeerLike = async (beerId: string) => {
    if (!user) {
      setSnackbarMessage("Inicia sesión para guardar cervezas en tus favoritos. 🍺");
      setSnackbarColor("var(--color-error)");
      setSnackbarOpen(true);
      return;
    }

    const beer = allBeers.find((b) => b._id === beerId);
    const liked = beer?.likes.includes((user._id as string) || (user.id as string) || "");

    try {
      await onToggleLike(beerId);
      setSnackbarMessage(liked ? "Like eliminado de favoritos ❌" : "¡Cerveza añadida a favoritos! 🍻");
      setSnackbarColor(liked ? "var(--color-error)" : "var(--color-amber-primary)");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al toggle beer like:", error);
    }
  };

  // Handle Place Favorite toggle
  const handleTogglePlaceFav = (placeId: string) => {
    const updatedIds = favoritosIds.includes(placeId)
      ? favoritosIds.filter((id) => id !== placeId)
      : [...favoritosIds, placeId];

    setFavoritosIds(updatedIds);
    localStorage.setItem("favoritos", JSON.stringify(updatedIds));

    const isFavNow = updatedIds.includes(placeId);
    setSnackbarMessage(isFavNow ? "¡Lugar guardado en tus favoritos! 🖤" : "Lugar removido de favoritos ❌");
    setSnackbarColor(isFavNow ? "var(--color-amber-primary)" : "var(--color-error)");
    setSnackbarOpen(true);
  };

  if (!mounted || !isAuthReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress sx={{ color: "var(--color-amber-primary)" }} />
      </div>
    );
  }

  return (
    <MainLayout
      maxWidth="calc(1140px + 4rem)"
      title="Mis"
      titleGradientText="Favoritos"
      subtitle="Tus cervezas preferidas y lugares imperdibles en un solo lugar."
      sidebar={
        <div className="flex flex-col gap-3.5 pr-1">
          <SidebarWidget label="Mi Pasaporte">
            {/* Total + nivel */}
            <div
              className="rounded-[1.2rem] border p-3.5 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(255,255,255,0.02))",
                borderColor: "color-mix(in srgb, var(--color-border-amber) 36%, var(--color-border-light))",
              }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-text-muted)" }}>
                Guardados en total
              </p>
              <p className="mt-1 text-4xl font-black leading-none" style={{ color: "var(--color-text-primary)" }}>
                {passport.total}
              </p>
              <p className="mt-1.5 text-[11px] font-bold" style={{ color: "var(--color-amber-primary)" }}>
                {passport.icon} {passport.level}
              </p>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${passport.progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "var(--gradient-button-primary)" }}
                />
              </div>
              <p className="mt-1.5 text-[9.5px]" style={{ color: "var(--color-text-muted)" }}>
                {passport.next}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div
                className="flex flex-col items-center rounded-[1rem] border px-2 py-2.5"
                style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)", background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-base leading-none">🍺</span>
                <span className="mt-1 text-lg font-black leading-none" style={{ color: "var(--color-text-primary)" }}>{favoritedBeers.length}</span>
                <span className="mt-0.5 text-[9px] font-semibold" style={{ color: "var(--color-text-muted)" }}>Cervezas</span>
              </div>
              <div
                className="flex flex-col items-center rounded-[1rem] border px-2 py-2.5"
                style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)", background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-base leading-none">📍</span>
                <span className="mt-1 text-lg font-black leading-none" style={{ color: "var(--color-text-primary)" }}>{favoritedPlaces.length}</span>
                <span className="mt-0.5 text-[9px] font-semibold" style={{ color: "var(--color-text-muted)" }}>Lugares</span>
              </div>
            </div>
          </SidebarWidget>

          <SidebarWidget label="Descubrir">
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => router.push("/cervezas")}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 border border-[var(--color-border-subtle)]"
                style={{ color: "var(--color-text-primary)", background: "rgba(255,255,255,0.02)" }}
              >
                <span>🍻</span> Catálogo de Cervezas
              </button>
              <button
                onClick={() => router.push("/lugares")}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 border border-[var(--color-border-subtle)]"
                style={{ color: "var(--color-text-primary)", background: "rgba(255,255,255,0.02)" }}
              >
                <span>📍</span> Mapa de Lugares
              </button>
              <button
                onClick={() => router.push("/posts")}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 border border-[var(--color-border-subtle)]"
                style={{ color: "var(--color-text-primary)", background: "rgba(255,255,255,0.02)" }}
              >
                <span>💬</span> Comunidad Cervecera
              </button>
            </div>
          </SidebarWidget>
        </div>
      }
    >
      <div className="flex w-full flex-col gap-6">
        {/* ─── Tu perfil cervecero (insights) ─── */}
        {passport.total > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="relative overflow-hidden rounded-[1.5rem] border p-5"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--color-amber-primary) 9%, transparent), color-mix(in srgb, var(--color-surface-card) 88%, transparent))",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 38%, var(--color-border-light))",
              boxShadow: "var(--shadow-card)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "var(--color-amber-primary)" }} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl border text-xl"
                  style={{ borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, transparent)", background: "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)" }}
                >
                  🍺
                </span>
                <div>
                  <h2 className="text-lg font-extrabold leading-tight text-[var(--color-text-primary)]">Tu perfil cervecero</h2>
                  <p className="text-[12.5px] leading-snug text-[var(--color-text-secondary)]">{profileTagline}</p>
                </div>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {profileTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="flex flex-col items-center justify-center rounded-[1rem] border px-2 py-2.5 text-center"
                  style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 66%, transparent)", background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="text-base leading-none">{tile.icon}</span>
                  <span className="mt-1 line-clamp-1 text-[13px] font-black leading-tight text-[var(--color-text-primary)]" title={tile.value}>
                    {tile.value}
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{tile.label}</span>
                </div>
              ))}
            </div>

            {/* Estilos favoritos (bar chart) */}
            {profile.styles.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Estilos favoritos</p>
                <div className="space-y-2">
                  {profile.styles.slice(0, 4).map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-[var(--color-text-primary)]">{s.name}</span>
                        <span className="font-bold text-[var(--color-text-muted)]">{s.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.count / profile.maxStyle) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "var(--gradient-button-primary)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="flex items-center gap-4 rounded-[1.5rem] border p-5"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--color-amber-primary) 7%, transparent), transparent)",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 34%, var(--color-border-light))",
            }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl"
              style={{ borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, transparent)", background: "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)" }}
            >
              🍺
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold leading-tight text-[var(--color-text-primary)]">Desbloquea tu perfil cervecero</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Guarda tus primeras cervezas y lugares para descubrir tus estilos favoritos, tu ABV promedio, tu estilo dominante y la ciudad donde más sales 🍻
              </p>
            </div>
          </motion.section>
        )}

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "var(--color-border-subtle)", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                color: "var(--color-text-muted)",
                fontSize: { xs: "13px", sm: "15px" },
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "inherit",
                transition: "color 0.3s",
                "&.Mui-selected": {
                  color: "var(--color-amber-primary)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--color-amber-primary)",
                height: "3px",
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label={`Cervezas (${favoritedBeers.length}) 🍺`} />
            <Tab label={`Lugares (${favoritedPlaces.length}) 📍`} />
          </Tabs>
        </Box>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 0 ? (
            <motion.div
              key="beers-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {beersLoading ? (
                <FavSkeletonGrid />
              ) : !user ? (
                <FavEmptyState
                  icon="🔒"
                  title="Inicia sesión para ver tus favoritas"
                  detail="Para guardar y sincronizar tus cervezas favoritas en todos tus dispositivos, necesitas estar conectado."
                  ctaLabel="Iniciar sesión"
                  onCta={() => router.push("/auth/login")}
                />
              ) : favoritedBeers.length === 0 ? (
                <FavEmptyState
                  icon="🍻"
                  title="Aún no tienes cervezas favoritas"
                  detail="Explora nuestro catálogo y dale clic al icono de brindis 🍻 en las cervezas que más te gusten."
                  ctaLabel="Explorar cervezas"
                  onCta={() => router.push("/cervezas")}
                />
              ) : (
                // Beers Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {favoritedBeers.map((beer) => (
                    <BeerCard
                      key={beer._id}
                      beer={beer}
                      userHasLiked={true}
                      onLike={() => handleToggleBeerLike(beer._id)}
                      onClick={() => router.push(`/cervezas/${beer._id}`)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="places-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {lugaresLoading ? (
                <FavSkeletonGrid />
              ) : favoritedPlaces.length === 0 ? (
                <FavEmptyState
                  icon="📍"
                  title="Aún no tienes lugares favoritos"
                  detail="Busca bares, taprooms y cervecerías en nuestro mapa y presiona el corazón 🖤 para guardarlos."
                  ctaLabel="Explorar lugares"
                  onCta={() => router.push("/lugares")}
                />
              ) : (
                // Places Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {favoritedPlaces.map((place) => {
                    const hasImage = Boolean(place.coverImage);
                    return (
                      <motion.div
                        key={place._id}
                        whileHover={{ y: -4, scale: 1.01, borderColor: "var(--color-amber-primary)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => router.push(`/lugares?id=${place._id}`)}
                        className="glass-card group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] backdrop-blur-sm transition-all duration-300 w-full"
                        style={{
                          background: "var(--color-surface-card)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        {/* Cover Image */}
                        <div
                          className="relative aspect-[5/3] overflow-hidden w-full"
                          style={{ background: "var(--color-surface-card-alt)" }}
                        >
                          {hasImage ? (
                            <Image
                              src={getImageUrl(place.coverImage!)}
                              alt={place.name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-5xl select-none">
                              🍻
                            </div>
                          )}

                          {/* Heart Icon toggle button */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlaceFav(place._id);
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.85 }}
                            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
                            style={{
                              background: "rgba(251,191,36,0.3)",
                              boxShadow: "0 0 12px rgba(251,191,36,0.4)",
                            }}
                          >
                            <span className="text-base leading-none">❤️</span>
                          </motion.button>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex flex-col gap-2">
                          <h3
                            className="text-base font-bold truncate transition-colors group-hover:text-amber-400"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {place.name}
                          </h3>
                          <p
                            className="text-xs line-clamp-2 min-h-[32px]"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {place.description}
                          </p>
                          <div
                            className="text-[11px] flex items-center gap-1 mt-1 font-medium"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <span>📍</span>
                            <span className="truncate">
                              {place.address.street}, {place.address.city}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: "100%",
            background: "var(--color-surface-elevated)",
            color: "var(--color-text-primary)",
            borderColor: snackbarColor,
            borderWidth: "1px",
            borderStyle: "solid",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            "& .MuiAlert-icon": {
              color: snackbarColor,
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </MainLayout>
  );
}
