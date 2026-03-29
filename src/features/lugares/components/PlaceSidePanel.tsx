"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography, Rating, Stack, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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

export default function PlaceSidePanel({
  places,
  selectedId,
  favoritos,
  onSelect,
  onToggleFavorito,
  onNavigate,
}: Props) {
  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        pr: 1,
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "var(--color-amber-dark)",
          borderRadius: 3,
        },
      }}
    >
      {places.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "var(--color-text-secondary)" }}>
            No se encontraron lugares
          </Typography>
        </Box>
      )}

      <Stack spacing={1.5}>
        {places.map((lugar) => {
          const isSelected = lugar._id === selectedId;
          const isFav = favoritos.includes(lugar._id);
          const avgRating = lugar.reviews?.length
            ? lugar.reviews.reduce((a, r) => a + r.rating, 0) / lugar.reviews.length
            : 0;
          const hasCoords = !!(lugar.coordinates?.lat && lugar.coordinates?.lng);

          return (
            <Box
              key={lugar._id}
              onClick={() => onSelect(lugar._id)}
              sx={{
                display: "flex",
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: isSelected
                  ? "rgba(251, 191, 36, 0.15)"
                  : "var(--color-surface-card)",
                border: isSelected
                  ? "1px solid var(--color-amber-primary)"
                  : "1px solid transparent",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isSelected
                    ? "rgba(251, 191, 36, 0.2)"
                    : "var(--color-surface-elevated)",
                },
              }}
            >
              {/* Thumbnail */}
              {lugar.coverImage ? (
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={getImageUrl(lugar.coverImage)}
                    alt={lugar.name}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    bgcolor: "var(--color-surface-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  🍻
                </Box>
              )}

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--color-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lugar.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorito(lugar._id);
                    }}
                    sx={{
                      color: isFav ? "var(--color-amber-primary)" : "var(--color-text-muted)",
                      p: 0.5,
                    }}
                  >
                    {isFav ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  {hasCoords && (
                    <LocationOnIcon sx={{ fontSize: 14, color: "var(--color-amber-primary)" }} />
                  )}
                  {lugar.address.city}, {lugar.address.country}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Rating value={avgRating} precision={0.5} readOnly size="small" />
                  <Typography sx={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                    {avgRating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
