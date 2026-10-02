"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import AiPromptBar from "./AiPromptBar";

const SERVICES = [
  { title: "Catálogo", text: "Estilo, IBU, ABV y ficha de cata de cada cerveza." },
  { title: "Lugares", text: "Cervecerías, taprooms y bares con dirección." },
  { title: "Comunidad", text: "Reseñas y publicaciones de quien las prueba." },
  { title: "Consulta", text: "Pregunta por un estilo, un maridaje o una cervecería." },
];

const FIGURES = [
  ["1.200+", "Cervezas"],
  ["280+", "Lugares"],
  ["Chile", "Cobertura"],
] as const;

export default function HeroSection() {
  const { user, isAuthReady } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <section
      className="border-b"
      style={{ background: "var(--gradient-hero)", borderColor: "var(--color-border-subtle)" }}
    >
      <div className="home-content-shell grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-16 lg:py-20">
        <div className="min-w-0">
          <p
            className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "#8c5a2b" }}
          >
            Cerveza artesanal · Chile
          </p>
          <h1
            className="mt-3 max-w-[18ch] text-[2.05rem] leading-[1.12] font-semibold tracking-[-0.03em] sm:text-[2.7rem] lg:text-[3.05rem]"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              color: "var(--color-text-primary)",
            }}
          >
            El registro de la cerveza que se hace y se bebe en Chile
          </h1>
          <p
            className="mt-4 max-w-xl text-[0.98rem] leading-relaxed sm:text-[1.05rem]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Un catálogo con ficha de cada cerveza, un mapa de lugares y una comunidad para anotar lo que pruebas.
          </p>

          {!isLoggedIn && isAuthReady && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                prefetch
                className="inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold"
                style={{ background: "#1e3a5f", color: "#f8f6f2" }}
              >
                Crear cuenta
              </Link>
              <Link
                href="/auth/login?plan=plus"
                prefetch
                className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold"
                style={{
                  borderColor: "var(--color-border-medium)",
                  color: "var(--color-text-primary)",
                  background: "#ffffff",
                }}
              >
                Lúpulos Plus
              </Link>
            </div>
          )}

          <div className="mt-8 max-w-xl">
            <p
              className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Consulta
            </p>
            <AiPromptBar embedded tone="plain" />
          </div>
        </div>

        <aside className="min-w-0 overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#e4dfd6" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "#e4dfd6" }}>
            <p
              className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Qué incluye
            </p>
          </div>
          <ul>
            {SERVICES.map((item) => (
              <li
                key={item.title}
                className="border-b px-5 py-4 last:border-b-0"
                style={{ borderColor: "#efeae2" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
          <div
            className="grid grid-cols-3 border-t text-center"
            style={{ borderColor: "#e4dfd6", background: "#f7f5f0" }}
          >
            {FIGURES.map(([value, label]) => (
              <div key={label} className="min-w-0 px-2 py-4">
                <p className="text-sm font-semibold" style={{ color: "#142033" }}>
                  {value}
                </p>
                <p
                  className="mt-1 text-[0.68rem] uppercase tracking-[0.06em]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
