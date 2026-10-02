"use client";

import React from "react";
import GoldenBackground from "@/components/GoldenBackground";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleGradient?: string;
  titleGradientText?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  sidebar?: React.ReactNode;
  showBackground?: boolean;
  topBanner?: React.ReactNode;
  tightWidth?: boolean;
  /** Override explícito del max-width del frame (ej. "1140px"). Tiene prioridad sobre tightWidth. */
  maxWidth?: string;
  /** Si la columna de widgets queda fija (sticky) al hacer scroll. Por defecto true. */
  stickySidebar?: boolean;
}

/**
 * MainLayout es el layout maestro unificado de Lúpulos App.
 * Se encarga de:
 * 1. Cargar el Navbar común responsivo.
 * 2. Cargar el fondo de partículas GoldenBackground.
 * 3. Centrar el contenido y manejar el padding lateral izquierdo para evitar colisiones con el Sidebar de navegación.
 * 4. Proveer una cuadrícula estructurada para el contenido principal y la columna lateral derecha (widgets).
 */
export default function MainLayout({
  children,
  title,
  titleGradient,
  titleGradientText,
  subtitle,
  actionButton,
  sidebar,
  showBackground = true,
  topBanner,
  tightWidth = false,
  maxWidth,
  stickySidebar = true,
}: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col text-[var(--color-text-primary)]">
      {/* Fondo premium de partículas */}
      {showBackground && <GoldenBackground />}

      {topBanner}

      {/* Contenedor principal con espaciado para Navbar lateral */}
      <div className="flex-1 w-full flex flex-col items-center justify-start py-6 relative z-[2]">
        <main
          className="w-full px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-8 items-start"
          style={{
            maxWidth:
              maxWidth ??
              (tightWidth
                ? sidebar
                  ? "calc(30.375rem + 280px + 2rem)"
                  : "30.375rem"
                : "1240px"),
          }}
        >
          
          {/* Columna de Contenido Principal */}
          <div className="flex-1 w-full min-w-0">
            {/* Header unificado si hay título */}
            {(title || subtitle || actionButton) && (
              <motion.div 
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6"
              >
                <div className="space-y-2">
                  {title && (
                    <h1 className="text-3xl font-heading font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-[var(--color-text-primary)]">
                      {title}{" "}
                      {(titleGradientText || titleGradient) && (
                        <span
                          style={{
                            background: (titleGradient && (titleGradient.includes("var") || titleGradient.includes("gradient")))
                              ? titleGradient
                              : "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 50%, var(--color-amber-hover) 100%)",
                            backgroundSize: "300% 300%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            animation: "magic-gradient-shift 4s ease-in-out infinite",
                          }}
                        >
                          {titleGradientText || (titleGradient && !titleGradient.includes("var") ? titleGradient : "")}
                        </span>
                      )}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actionButton && (
                  <div className="shrink-0 flex items-center">
                    {actionButton}
                  </div>
                )}
              </motion.div>
            )}

            {/* Contenido de la página */}
            {children}
          </div>

          {/* Columna de Widgets Derecha (Desktop) */}
          {sidebar && (
            <div
              className={`hidden xl:block w-[280px] shrink-0 self-start ${
                stickySidebar ? "sticky top-24" : ""
              }`}
            >
              {sidebar}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
