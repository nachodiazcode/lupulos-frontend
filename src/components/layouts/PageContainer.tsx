"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer es el componente estándar de maquetación de Lúpulos.
 * Asegura que todas las páginas mantengan el mismo ancho máximo de 1240px,
 * estén perfectamente centradas y tengan paddings consistentes en móvil y desktop.
 */
export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <main className={`relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-[1240px] w-full">
        {children}
      </div>
    </main>
  );
}
