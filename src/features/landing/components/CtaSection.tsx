"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QUOTES } from "./data";

export default function CtaSection() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <section
      className="border-b py-14 sm:py-20"
      style={{ background: "#142033", borderColor: "rgba(255,255,255,0.08)" }}
      aria-label="Crear cuenta"
    >
      <div className="home-content-shell grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:gap-12">
        <div className="min-w-0">
          <blockquote
            className="max-w-2xl text-lg leading-relaxed font-medium sm:text-xl"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              color: "#f8f6f2",
            }}
          >
            {quote}
          </blockquote>
          <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-[#f8f6f2] sm:text-[1.85rem]">
            Abre una cuenta y guarda lo que pruebas
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "rgba(248,246,242,0.72)" }}>
            La cuenta es gratuita. Lúpulos Plus agrega herramientas para quien publica o administra un lugar.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
          <Link
            href="/auth/register"
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#f8f6f2] px-5 text-sm font-semibold text-[#142033]"
          >
            Crear cuenta
          </Link>
          <Link
            href="/auth/login"
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/25 px-5 text-sm font-semibold text-[#f8f6f2]"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </section>
  );
}
