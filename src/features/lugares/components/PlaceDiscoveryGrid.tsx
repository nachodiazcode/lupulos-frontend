"use client";

import React from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Rating,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import { motion, type Variants } from "framer-motion";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

import type { Place } from "../types";
import { getImageUrl } from "@/lib/constants";

interface Props {
  places: Place[];
  selectedId: string | null;
  favoritos: string[];
  onSelect: (id: string) => void;
  onToggleFavorito: (id: string) => void;
  onNavigate: (id: string) => void;
  usuario?: { _id?: string; id?: string; username?: string } | null;
  onClaim?: (place: Place) => void;
  onAdmin?: (place: Place) => void;
}

function getAverageRating(place: Place) {
  if (!place.reviews?.length) return 0;
  return place.reviews.reduce((acc, review) => acc + review.rating, 0) / place.reviews.length;
}

function getReviewCount(place: Place) {
  return place.reviews?.length ?? 0;
}

function hasCoordinates(place: Place) {
  return Boolean(place.coordinates?.lat && place.coordinates?.lng);
}

function getSnippet(place: Place) {
  const description = place.description?.trim();
  if (!description) return "Un nuevo spot cervecero esperando ser descubierto.";
  if (description.length <= 118) return description;
  return `${description.slice(0, 115).trimEnd()}…`;
}

function getBadges(place: Place, averageRating: number) {
  const badges: string[] = [];

  if (averageRating >= 4.7) badges.push("Top comunidad");
  if (place.coverImage) badges.push("Con foto");
  if (hasCoordinates(place)) badges.push("En mapa");
  if (getReviewCount(place) >= 3) badges.push("Probado");

  return badges.slice(0, 3);
}

function getMoodLine(place: Place, averageRating: number) {
  const reviews = getReviewCount(place);

  if (averageRating >= 4.8 && reviews >= 3) return "Apuesta segura para una buena salida.";
  if (Boolean(place.coverImage) && hasCoordinates(place)) return "Se ve bien y encima es fácil de ubicar.";
  if (reviews >= 4) return "Tiene varias voces de la comunidad detrás.";
  if (hasCoordinates(place)) return "Perfecto para improvisar una ruta.";
  return "Un rincón con potencial para sorprenderte.";
}

export default function PlaceDiscoveryGrid({
  places,
  selectedId,
  favoritos,
  onSelect,
  onToggleFavorito,
  onNavigate,
  usuario,
  onClaim,
  onAdmin,
}: Props) {
  if (places.length === 0) {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          minHeight: "440px",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: "1.9rem",
          border: "1px solid color-mix(in srgb, var(--color-border-light) 72%, transparent)",
          background: "var(--gradient-feed-empty-state)",
          boxShadow: "var(--shadow-card)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          px: 3,
          py: 8,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 54 }}>📍</Typography>
        <Typography sx={{ mt: 3, fontSize: 22, fontWeight: 900, color: "var(--color-text-primary)" }}>
          El mapa sigue creciendo
        </Typography>
        <Typography sx={{ mt: 1.5, maxWidth: 380, fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          No encontramos un lugar con ese mood. Prueba otra ciudad o vuelve al modo principal para seguir explorando.
        </Typography>
      </Box>
    );
  }

  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const cardPop: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 22 } 
    }
  };

  return (
    <Box
      component={motion.div}
      variants={stagger}
      initial="hidden"
      animate="visible"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
        },
        gap: 2.5,
      }}
    >
      {places.map((place) => {
        const isSelected = place._id === selectedId;
        const isFav = favoritos.includes(place._id);
        const averageRating = getAverageRating(place);
        const reviewCount = getReviewCount(place);
        const badges = getBadges(place, averageRating);
        const hasImage = Boolean(place.coverImage);
        const hasPromos = place.promotions && place.promotions.length > 0;
        const hasBeersOnTap = place.beers && place.beers.length > 0;

        return (
          <Box
            key={place._id}
            component={motion.div}
            variants={cardPop}
            whileHover={{
              y: -4,
              scale: 1.01,
              borderColor: "var(--color-amber-primary)",
              boxShadow: "var(--shadow-amber-glow)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => onSelect(place._id)}
            onFocus={() => onSelect(place._id)}
            tabIndex={0}
            sx={{
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              borderRadius: "18px",
              border: isSelected
                ? "1.5px solid var(--color-amber-primary)"
                : "1px solid var(--color-border-subtle)",
              background: isSelected
                ? "linear-gradient(180deg, rgba(251,191,36,0.04) 0%, var(--color-surface-card) 100%)"
                : "var(--color-surface-card)",
              boxShadow: isSelected ? "var(--shadow-amber-glow)" : "var(--shadow-card)",
              cursor: "pointer",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              "& .place-card-media": {
                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              },
              "&:hover .place-card-media": {
                transform: "scale(1.06)",
              },
            }}
          >
            {/* Left Image section */}
            <Box
              sx={{
                position: "relative",
                width: { xs: "100%", md: "200px" },
                height: { xs: "180px", md: "auto" },
                minHeight: { md: "240px" },
                overflow: "hidden",
                flexShrink: 0,
                borderRight: { md: "1px solid var(--color-border-subtle)" },
                borderBottom: { xs: "1px solid var(--color-border-subtle)", md: "none" },
              }}
            >
              {hasImage ? (
                <Image
                  src={getImageUrl(place.coverImage!)}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="place-card-media object-cover"
                />
              ) : (
                <Box
                  className="place-card-media"
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "radial-gradient(circle at top, rgba(251,191,36,0.20), rgba(14,14,14,0.05) 50%), linear-gradient(135deg, rgba(120,53,15,0.75), rgba(41,24,16,0.90))",
                    color: "var(--color-text-primary)",
                    fontSize: 48,
                  }}
                >
                  🍻
                </Box>
              )}

              {/* Light overlay for gradient contrast */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(12,10,9,0.35) 0%, transparent 40%, rgba(12,10,9,0.5) 100%)",
                }}
              />

              {/* Overlaid Badges on Image (clean and subtle) */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{
                  position: "absolute",
                  inset: 0,
                  p: 1.5,
                  zIndex: 2,
                }}
              >
                <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                  {place.owner && (
                    <Box
                      sx={{
                        borderRadius: "6px",
                        border: "1px solid rgba(251,191,36,0.5)",
                        background: "rgba(17,24,39,0.75)",
                        px: 1,
                        py: 0.4,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#fbbf24",
                        }}
                      >
                        👑 Socio
                      </Typography>
                    </Box>
                  )}
                  {badges.map((badge) => (
                    <Box
                      key={badge}
                      sx={{
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(17,24,39,0.65)",
                        px: 1,
                        py: 0.4,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 8.5,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "white",
                        }}
                      >
                        {badge}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorito(place._id);
                  }}
                  sx={{
                    color: isFav ? "var(--color-amber-primary)" : "white",
                    background: "rgba(17,24,39,0.6)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "5px",
                    "&:hover": {
                      background: "rgba(17,24,39,0.8)",
                    },
                  }}
                >
                  {isFav ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: { xs: 1.5, md: 2 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minWidth: 0,
              }}
            >
              <Box>
                {/* City & Name Row */}
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {place.address.city}, {place.address.country}
                  </Typography>
                  
                  {hasCoordinates(place) && (
                    <Stack direction="row" alignItems="center" spacing={0.3} sx={{ color: "var(--color-amber-primary)" }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 12 }} />
                      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)" }}>
                        En mapa
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Typography
                  variant="h3"
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: 18, md: 21 },
                    fontWeight: 800,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {place.name}
                </Typography>

                {/* Rating & Short info */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.8 }}>
                  <Rating
                    value={averageRating}
                    precision={0.5}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": { color: "var(--color-amber-primary)" },
                      "& .MuiRating-iconEmpty": { color: "var(--color-border-medium)" },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    · {reviewCount} reseña{reviewCount === 1 ? "" : "s"}
                  </Typography>
                </Stack>

                {/* Mood sentence (Apuesta segura, etc.) */}
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 12.5,
                    color: "var(--color-amber-primary)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{getMoodLine(place, averageRating)}&rdquo;
                </Typography>

                {/* Description snippet */}
                <Typography
                  sx={{
                    mt: 1.2,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {getSnippet(place)}
                </Typography>

                {/* Vibe Ambient Tags (clean flat layout) */}
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  {place.hasTerrace && (
                    <Box sx={{ borderRadius: "6px", border: "1px solid var(--color-border-light)", px: 1, py: 0.3, background: "rgba(255,255,255,0.02)" }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)" }}>☀️ Terraza</Typography>
                    </Box>
                  )}
                  {place.hasLiveMusic && (
                    <Box sx={{ borderRadius: "6px", border: "1px solid var(--color-border-light)", px: 1, py: 0.3, background: "rgba(255,255,255,0.02)" }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)" }}>🎸 Música en vivo</Typography>
                    </Box>
                  )}
                  {place.isPetFriendly && (
                    <Box sx={{ borderRadius: "6px", border: "1px solid var(--color-border-light)", px: 1, py: 0.3, background: "rgba(255,255,255,0.02)" }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)" }}>🐾 Pet-Friendly</Typography>
                    </Box>
                  )}
                </Stack>

                {/* Active Promotions / Happy Hour Banner (simple structured layout) */}
                {hasPromos && place.promotions && (
                  <Box
                    sx={{
                      mt: 1.5,
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.2)",
                      background: "linear-gradient(90deg, rgba(239,68,68,0.05) 0%, transparent 100%)",
                      p: 1.2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <Typography sx={{ fontSize: 14 }}>🔥</Typography>
                    <Box>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Promo Activa · {place.promotions[0].discountPercent}% Dcto
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", mt: 0.1 }}>
                        {place.promotions[0].description}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Beers on Tap List */}
                {hasBeersOnTap && place.beers && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      🍻 Pinchadas en barra:
                    </Typography>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.5, gap: 0.6 }}>
                      {place.beers.map((beer) => (
                        <Box
                          key={beer._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`/cervezas/${beer._id}`);
                          }}
                          sx={{
                            borderRadius: "6px",
                            border: "1px solid var(--color-border-light)",
                            px: 1,
                            py: 0.35,
                            background: "rgba(255,255,255,0.03)",
                            cursor: "pointer",
                            transition: "all 150ms ease",
                            "&:hover": {
                              borderColor: "var(--color-amber-primary)",
                              background: "rgba(251,191,36,0.04)",
                            },
                          }}
                        >
                          <Typography sx={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-primary)" }}>
                            {beer.name} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({beer.brewery})</span>
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Action Buttons Row (clean rectangular border radius) */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2.5, width: "100%" }}>
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    onNavigate(place._id);
                  }}
                  endIcon={<ArrowOutwardRoundedIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    flex: 1.5,
                    borderRadius: "8px",
                    px: 1.5,
                    height: "38px",
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "11.5px",
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    minWidth: 0,
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": {
                      background: "var(--gradient-button-primary)",
                      filter: "brightness(1.12)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(251,191,36,0.3)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Descubrir
                </Button>

                {/* Claim / Admin Actions */}
                {usuario && (
                  <>
                    {place.owner ? (
                      place.owner === (usuario._id || usuario.id) ? (
                        <Button
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdmin?.(place);
                          }}
                          sx={{
                            flex: 1.2,
                            borderRadius: "8px",
                            px: 1,
                            height: "38px",
                            background: "rgba(59,130,246,0.1)",
                            color: "#60a5fa",
                            border: "1px solid rgba(59,130,246,0.2)",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "11.5px",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                            "&:hover": {
                              background: "rgba(59,130,246,0.15)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
                            },
                            "&:active": {
                              transform: "translateY(0)",
                            },
                          }}
                        >
                          ⚙️ Gestión
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            flex: 1.2,
                            borderRadius: "8px",
                            px: 1,
                            height: "38px",
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                            🛡️ Verificado
                          </Typography>
                        </Box>
                      )
                    ) : (
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(place);
                        }}
                        sx={{
                          flex: 1.2,
                          borderRadius: "8px",
                          px: 1,
                          height: "38px",
                          background: "rgba(251,191,36,0.08)",
                          color: "var(--color-amber-primary)",
                          border: "1px solid rgba(251,191,36,0.15)",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "11.5px",
                          whiteSpace: "nowrap",
                          minWidth: 0,
                          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                          "&:hover": {
                            background: "rgba(251,191,36,0.12)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(251,191,36,0.15)",
                          },
                          "&:active": {
                            transform: "translateY(0)",
                          },
                        }}
                      >
                        📢 Reclamar
                      </Button>
                    )}
                  </>
                )}

                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(place._id);
                  }}
                  startIcon={<MapOutlinedIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    flex: 0.8,
                    borderRadius: "8px",
                    px: 1,
                    height: "38px",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border-light)",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "11.5px",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.06)",
                      borderColor: "var(--color-text-secondary)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Mapa
                </Button>
              </Stack>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
