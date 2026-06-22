"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { beerStyles } from "../data/beerStyles";
import { motion } from "framer-motion";

/** Paleta por estilo de cerveza: degradado del tile, tinte de fondo, glow, borde y color de título. */
type StyleTheme = { grad: string; tint: string; glow: string; border: string; text: string };

const STYLE_THEMES: Record<string, StyleTheme> = {
  lager:   { grad: "linear-gradient(135deg,#fbd24b,#e09b1f)", tint: "rgba(245,190,60,0.10)", glow: "rgba(245,190,60,0.35)", border: "rgba(245,190,60,0.40)", text: "#f6c945" },
  pilsner: { grad: "linear-gradient(135deg,#f8df66,#e6c024)", tint: "rgba(245,210,70,0.10)", glow: "rgba(245,210,70,0.35)", border: "rgba(245,210,70,0.40)", text: "#f3d24f" },
  ale:     { grad: "linear-gradient(135deg,#ee9b34,#bf6a1c)", tint: "rgba(232,150,50,0.10)", glow: "rgba(232,150,50,0.35)", border: "rgba(232,150,50,0.42)", text: "#ef9b3a" },
  ipa:     { grad: "linear-gradient(135deg,#f4a51c,#c66518)", tint: "rgba(240,160,30,0.10)", glow: "rgba(240,160,30,0.35)", border: "rgba(240,160,30,0.42)", text: "#f2a62a" },
  bock:    { grad: "linear-gradient(135deg,#a8703c,#5a3414)", tint: "rgba(168,112,60,0.12)", glow: "rgba(168,112,60,0.38)", border: "rgba(190,130,75,0.45)", text: "#cf9258" },
  porter:  { grad: "linear-gradient(135deg,#7d4d2e,#3a2110)", tint: "rgba(125,77,46,0.12)",  glow: "rgba(125,77,46,0.38)",  border: "rgba(160,105,68,0.45)", text: "#bd8753" },
  stout:   { grad: "linear-gradient(135deg,#5f4332,#1c1209)", tint: "rgba(95,67,50,0.14)",   glow: "rgba(95,67,50,0.42)",   border: "rgba(155,115,88,0.45)", text: "#c69d76" },
};
const DEFAULT_THEME: StyleTheme = {
  grad: "linear-gradient(135deg,var(--color-amber-primary),var(--color-amber-hover))",
  tint: "rgba(245,158,11,0.10)",
  glow: "rgba(245,158,11,0.32)",
  border: "rgba(245,158,11,0.40)",
  text: "var(--color-amber-primary)",
};

export default function GuiaPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStyles = beerStyles.filter(
    (style) =>
      style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      style.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-[1140px]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 border-b border-[var(--color-border-subtle)] pb-6"
        >
          <h1 className="text-3xl font-heading font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-[var(--color-text-primary)]">
            La Guía{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 50%, var(--color-amber-hover) 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "magic-gradient-shift 4s ease-in-out infinite",
              }}
            >
              Cervecera
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-[var(--color-text-secondary)]">
            Descubre los distintos estilos de cerveza, aprende a diferenciarlos y conviértete en un experto.
          </p>
        </motion.header>

        {/* Buscador */}
        <div className="mb-8">
          <div className="relative flex h-14 w-full items-center rounded-full bg-[var(--color-surface-card)] px-5 shadow-sm border border-[color-mix(in_srgb,var(--color-border-light)_40%,transparent)] transition-all focus-within:border-[var(--color-amber-primary)] focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-amber-primary)_18%,transparent)]">
            <svg
              className="mr-4 text-[var(--color-text-muted)]"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tipo de cerveza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Grilla de estilos */}
        {filteredStyles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStyles.map((style, index) => {
              const theme = STYLE_THEMES[style.id] ?? DEFAULT_THEME;
              return (
                <motion.article
                  key={style.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(160deg, ${theme.tint} 0%, var(--color-surface-card) 55%)`,
                    borderColor: theme.border,
                  }}
                >
                  {/* Glow de color en la esquina */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                    style={{ background: theme.grad }}
                  />

                  <div className="relative flex items-center gap-4">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                      style={{ background: theme.grad, boxShadow: `0 10px 24px ${theme.glow}` }}
                    >
                      {style.image}
                    </div>
                    <h3 className="text-lg font-extrabold leading-tight" style={{ color: theme.text }}>
                      {style.name}
                    </h3>
                  </div>

                  <p className="relative mt-4 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                    {style.description}
                  </p>

                  <div
                    className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ color: theme.text }}
                  >
                    Conocer más
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <svg className="mx-auto mb-4 opacity-50" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-lg">No encontramos estilos que coincidan con &quot;{searchTerm}&quot;.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
