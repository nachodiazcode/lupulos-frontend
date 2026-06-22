"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Rating } from "@mui/material";
import { getImageUrl } from "@/lib/constants";
import type { Beer } from "@/features/beers/model/types";

interface BeerCardProps {
  beer: Beer;
  userHasLiked: boolean;
  onLike: () => void;
  onClick: () => void;
}

const cardPop: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 22 } 
  }
};

export default function BeerCard({
  beer,
  userHasLiked,
  onLike,
  onClick,
}: BeerCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={cardPop}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="glass-card group relative cursor-pointer overflow-hidden rounded-[1.5rem] border backdrop-blur-sm transition-all duration-300 w-full"
      style={{
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      {/* Sweep de brillo shimmer en hover */}
      <span
        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />

      {/* Imagen de la Cerveza */}
      <div
        className="relative aspect-[5/3] overflow-hidden w-full"
        style={{ background: "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--color-amber-primary) 10%, var(--color-surface-card-alt)) 0%, var(--color-surface-card-alt) 60%)" }}
      >
        {beer.image && !imgError ? (
          <Image
            src={getImageUrl(beer.image)}
            alt={beer.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 select-none">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-[12%] top-0 h-20"
              style={{
                background: "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--color-amber-primary) 22%, transparent), transparent 70%)",
                filter: "blur(28px)",
                opacity: 0.7,
              }}
            />
            <span className="text-5xl" style={{ opacity: 0.8, filter: "drop-shadow(0 2px 8px rgba(251,191,36,0.25))" }}>🍺</span>
            <span
              className="font-bold uppercase tracking-[0.28em]"
              style={{ fontSize: "10px", color: "color-mix(in srgb, var(--color-amber-primary) 70%, transparent)" }}
            >
              LUPULØS
            </span>
          </div>
        )}

        {/* Capa de gradiente oscuro sobre la imagen en hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Botón de Like interactivo */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          whileHover={{ scale: 1.2, rotate: 8 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
          style={{
            background: userHasLiked ? "rgba(251,191,36,0.3)" : "rgba(0,0,0,0.4)",
            boxShadow: userHasLiked ? "0 0 12px rgba(251,191,36,0.4)" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={userHasLiked ? "liked" : "not"}
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="text-base leading-none"
            >
              {userHasLiked ? "🍻" : "🤍"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Badge del porcentaje de alcohol (ABV) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
          style={{
            background: "var(--gradient-button-primary)",
            color: "var(--color-text-dark)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {beer.abv}% ABV
        </motion.div>
      </div>

      {/* Contenido descriptivo */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3
            className="truncate text-lg font-bold tracking-tight transition-colors duration-200"
            style={{ color: "var(--color-text-primary)" }}
          >
            {beer.name}
          </h3>

          {/* Estilo y cervecería */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-200 group-hover:border-amber-primary/50"
              style={{
                borderColor: "var(--color-border-amber)",
                color: "var(--color-amber-primary)",
                background: "rgba(251,191,36,0.06)",
              }}
            >
              {beer.style}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {beer.brewery}
            </span>
          </div>

          {beer.description && (
            <p
              className="mt-3 hidden text-sm xl:line-clamp-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {beer.description}
            </p>
          )}
        </div>

        {/* Puntuación */}
        <div className="mt-3 flex items-center gap-2">
          <Rating
            value={beer.averageRating || 0}
            precision={0.5}
            readOnly
            size="small"
            sx={{
              "& .MuiRating-iconFilled": { color: "var(--color-amber-primary)" },
              "& .MuiRating-iconEmpty": { color: "var(--color-border-medium)" },
            }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-amber-primary)" }}
          >
            {beer.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>

        {/* Footer del card */}
        <div
          className="mt-4 flex items-center justify-between text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>
            Por{" "}
            <strong className="font-bold" style={{ color: "var(--color-text-secondary)" }}>
              {beer.createdBy?.username ?? "—"}
            </strong>
          </span>
          <span className="font-semibold" style={{ color: "var(--color-amber-primary)" }}>
            🍻 {beer.likes.length}
          </span>
        </div>
      </div>

      {/* Línea de detalle inferior en hover */}
      <div
        className="h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background:
            "linear-gradient(90deg, var(--color-amber-primary), var(--color-orange-cta), transparent)",
        }}
      />
    </motion.div>
  );
}
