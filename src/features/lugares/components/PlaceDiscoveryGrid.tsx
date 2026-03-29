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

function getQuickHighlight(place: Place, averageRating: number) {
  const reviews = getReviewCount(place);

  if (averageRating >= 4.7) return "Top del momento";
  if (reviews >= 5) return `${reviews} opiniones`;
  if (Boolean(place.coverImage)) return "Visual ganador";
  if (hasCoordinates(place)) return "Listo para escapada";
  return "Nuevo hallazgo";
}

export default function PlaceDiscoveryGrid({
  places,
  selectedId,
  favoritos,
  onSelect,
  onToggleFavorito,
  onNavigate,
}: Props) {
  if (places.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-card)",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>
          No encontramos un lugar con ese mood
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 13, color: "var(--color-text-secondary)" }}>
          Prueba otra ciudad, cambia el filtro o vuelve al modo principal para seguir explorando.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {places.map((place) => {
        const isSelected = place._id === selectedId;
        const isFav = favoritos.includes(place._id);
        const averageRating = getAverageRating(place);
        const reviewCount = getReviewCount(place);
        const badges = getBadges(place, averageRating);
        const hasImage = Boolean(place.coverImage);

        return (
          <Box
            key={place._id}
            onClick={() => onSelect(place._id)}
            onMouseEnter={() => onSelect(place._id)}
            onFocus={() => onSelect(place._id)}
            tabIndex={0}
            sx={{
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              borderRadius: 4,
              border: isSelected
                ? "1px solid var(--color-amber-primary)"
                : "1px solid var(--color-border-subtle)",
              background: isSelected
                ? "linear-gradient(180deg, rgba(251,191,36,0.10) 0%, var(--color-surface-card) 48%)"
                : "var(--color-surface-card)",
              boxShadow: isSelected ? "var(--shadow-amber-glow)" : "var(--shadow-card)",
              transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "var(--color-amber-primary)",
                boxShadow: "var(--shadow-amber-glow)",
              },
              "& .place-card-media": {
                transition: "transform 420ms ease",
              },
              "& .place-card-glow": {
                opacity: isSelected ? 1 : 0,
                transition: "opacity 240ms ease",
              },
              "&:hover .place-card-media": {
                transform: "scale(1.05)",
              },
              "&:hover .place-card-glow": {
                opacity: 1,
              },
            }}
          >
            <Box
              className="place-card-glow"
              sx={{
                pointerEvents: "none",
                position: "absolute",
                top: -36,
                right: -20,
                zIndex: 0,
                height: 124,
                width: 124,
                borderRadius: "50%",
                background: "rgba(251,191,36,0.18)",
                filter: "blur(30px)",
              }}
            />
            <Box
              sx={{
                position: "relative",
                aspectRatio: "16 / 10",
                overflow: "hidden",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              {hasImage ? (
                <Image
                  src={getImageUrl(place.coverImage!)}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
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
                      "radial-gradient(circle at top, rgba(251,191,36,0.30), rgba(14,14,14,0.10) 45%), linear-gradient(135deg, rgba(120,53,15,0.85), rgba(41,24,16,0.95))",
                    color: "var(--color-text-primary)",
                    fontSize: 54,
                  }}
                >
                  🍺
                </Box>
              )}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(12,10,9,0.12) 0%, rgba(12,10,9,0.20) 35%, rgba(12,10,9,0.86) 100%)",
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{
                  position: "absolute",
                  inset: 0,
                  p: 1.5,
                }}
              >
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {isSelected && (
                    <Box
                      sx={{
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(251,191,36,0.18)",
                        px: 1.1,
                        py: 0.45,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "white",
                        }}
                      >
                        En radar
                      </Typography>
                    </Box>
                  )}
                  {badges.map((badge) => (
                    <Box
                      key={badge}
                      sx={{
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(17,24,39,0.38)",
                        px: 1.1,
                        py: 0.45,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
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
                    background: "rgba(17,24,39,0.38)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    "&:hover": {
                      background: "rgba(17,24,39,0.55)",
                    },
                  }}
                >
                  {isFav ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                </IconButton>
              </Stack>

              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  left: 0,
                  p: 1.75,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  {place.address.city}, {place.address.country}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 22,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "white",
                  }}
                >
                  {place.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.75,
                    maxWidth: "90%",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {getMoodLine(place, averageRating)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "var(--color-text-secondary)",
                  minHeight: 64,
                }}
              >
                {getSnippet(place)}
              </Typography>

              <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, gap: 1 }}>
                <Box
                  sx={{
                    borderRadius: 999,
                    border: "1px solid var(--color-border-light)",
                    px: 1.2,
                    py: 0.55,
                    background: "rgba(251,191,36,0.06)",
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    ✨ {getQuickHighlight(place, averageRating)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    borderRadius: 999,
                    border: "1px solid var(--color-border-light)",
                    px: 1.2,
                    py: 0.55,
                    background: "rgba(251,191,36,0.06)",
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {reviewCount ? `💬 ${reviewCount} voces` : "🍺 Sé el primero en opinar"}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1.5, gap: 1 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
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
                  <Typography sx={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {averageRating.toFixed(1)} · {reviewCount} reseña{reviewCount === 1 ? "" : "s"}
                  </Typography>
                </Stack>

                {hasCoordinates(place) && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <LocationOnOutlinedIcon
                      sx={{ fontSize: 15, color: "var(--color-amber-primary)" }}
                    />
                    <Typography sx={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      En mapa
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  onClick={(event) => {
                    event.stopPropagation();
                    onNavigate(place._id);
                  }}
                  endIcon={<ArrowOutwardRoundedIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    py: 1.1,
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": {
                      background: "var(--gradient-button-primary)",
                      filter: "brightness(1.03)",
                    },
                  }}
                >
                  Descubrir lugar
                </Button>

                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(place._id);
                  }}
                  startIcon={<MapOutlinedIcon />}
                  sx={{
                    flexShrink: 0,
                    borderRadius: 999,
                    px: 1.75,
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border-light)",
                    textTransform: "none",
                    fontWeight: 700,
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
