"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { beerStyles } from "../data/beerStyles";
import { motion } from "framer-motion";

/** Paleta por estilo de cerveza: degradado del tile, tinte de fondo, glow, borde y color de título. */
type StyleTheme = { grad: string; tint: string; glow: string; border: string; text: string };

const STYLE_THEMES: Record<string, StyleTheme> = {
  lager:   { grad: "linear-gradient(135deg,#fbd24b,#e09b1f)", tint: "rgba(245,190,60,0.34)", glow: "rgba(245,190,60,0.35)", border: "rgba(196,140,20,0.55)", text: "#f6c945" },
  pilsner: { grad: "linear-gradient(135deg,#f8df66,#e6c024)", tint: "rgba(245,210,70,0.34)", glow: "rgba(245,210,70,0.35)", border: "rgba(190,150,20,0.55)", text: "#f3d24f" },
  ale:     { grad: "linear-gradient(135deg,#ee9b34,#bf6a1c)", tint: "rgba(232,150,50,0.30)", glow: "rgba(232,150,50,0.35)", border: "rgba(190,110,30,0.55)", text: "#ef9b3a" },
  ipa:     { grad: "linear-gradient(135deg,#f4a51c,#c66518)", tint: "rgba(240,160,30,0.30)", glow: "rgba(240,160,30,0.35)", border: "rgba(190,110,20,0.55)", text: "#f2a62a" },
  bock:    { grad: "linear-gradient(135deg,#a8703c,#5a3414)", tint: "rgba(168,112,60,0.28)", glow: "rgba(168,112,60,0.38)", border: "rgba(140,90,48,0.55)", text: "#cf9258" },
  porter:  { grad: "linear-gradient(135deg,#7d4d2e,#3a2110)", tint: "rgba(125,77,46,0.26)",  glow: "rgba(125,77,46,0.38)",  border: "rgba(120,72,40,0.55)", text: "#bd8753" },
  stout:   { grad: "linear-gradient(135deg,#5f4332,#1c1209)", tint: "rgba(95,67,50,0.30)",   glow: "rgba(95,67,50,0.42)",   border: "rgba(110,78,55,0.6)", text: "#c69d76" },
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
          className="mb-5 border-b border-[var(--color-border-subtle)] pb-5 sm:mb-6"
        >
          <h1 className="text-[1.65rem] font-heading font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            La Guía Cervecera
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
            Siete estilos para distinguir qué estás tomando, del rubio ligero al oscuro tostado.
          </p>
        </motion.header>

        <div className="mb-4 sm:mb-5">
          <label className="relative flex h-12 w-full min-w-0 items-center rounded-2xl border border-[color-mix(in_srgb,var(--color-text-primary)_16%,transparent)] bg-[var(--color-surface-card)] px-4 shadow-[0_8px_24px_rgba(7,27,18,0.05)] transition-shadow focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-amber-primary)_22%,transparent)]">
            <span className="sr-only">Buscar estilo</span>
            <svg
              className="mr-3 shrink-0 text-[var(--color-text-muted)]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Buscar un estilo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </label>
          <p className="mt-2 text-xs font-medium text-[var(--color-text-muted)]" aria-live="polite">
            {filteredStyles.length === 1
              ? "1 estilo"
              : `${filteredStyles.length} estilos`}
          </p>
        </div>

        {filteredStyles.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
            {filteredStyles.map((style, index) => {
              const theme = STYLE_THEMES[style.id] ?? DEFAULT_THEME;
              return (
                <motion.article
                  key={style.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
                  className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border bg-[var(--color-surface-card)] p-4 sm:p-5"
                  style={{
                    borderColor: theme.border,
                    backgroundImage: `linear-gradient(180deg, ${theme.tint} 0%, var(--color-surface-card) 62%)`,
                    boxShadow: "0 12px 32px rgba(7, 27, 18, 0.06)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ background: theme.grad }}
                  />
                  <div className="flex min-w-0 items-center gap-3 pt-1.5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                      style={{ background: theme.grad }}
                      aria-hidden="true"
                    >
                      {style.image}
                    </div>
                    <h2 className="min-w-0 text-base font-extrabold leading-tight text-[var(--color-text-primary)] sm:text-lg">
                      {style.name}
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {style.description}
                  </p>
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
