"use client";

import Link from "next/link";

const PILLARS = [
  {
    index: "01",
    title: "Catálogo",
    text: "Fichas con estilo, amargor y graduación. Sirve para comparar antes de comprar o de pedir.",
    href: "/cervezas",
    cta: "Ver el catálogo",
  },
  {
    index: "02",
    title: "Lugares",
    text: "Cervecerías y bares con dirección, para armar una salida o encontrar quién produce cerca.",
    href: "/lugares",
    cta: "Ver el mapa",
  },
  {
    index: "03",
    title: "Comunidad",
    text: "Quien prueba deja una nota. El registro crece con reseñas, fotos y publicaciones.",
    href: "/posts",
    cta: "Ver publicaciones",
  },
] as const;

export default function CommunitySection() {
  return (
    <section
      className="border-b py-14 sm:py-20"
      style={{ background: "#fbfaf7", borderColor: "var(--color-border-subtle)" }}
      aria-label="Servicios"
    >
      <div className="home-content-shell">
        <div className="max-w-2xl">
          <p
            className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "#8c5a2b" }}
          >
            La plataforma
          </p>
          <h2
            className="mt-3 text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] sm:text-[2.15rem]"
            style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              color: "var(--color-text-primary)",
            }}
          >
            Tres registros, un solo lugar
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Pensado para cervecerías, bares y para quien quiere saber qué está tomando.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PILLARS.map((item) => (
            <article
              key={item.index}
              className="flex min-w-0 flex-col rounded-lg border bg-white p-5 sm:p-6"
              style={{ borderColor: "#e4dfd6" }}
            >
              <p
                className="text-[0.68rem] font-semibold tracking-[0.14em]"
                style={{ color: "#8c5a2b" }}
              >
                {item.index}
              </p>
              <h3
                className="mt-3 text-xl font-semibold tracking-[-0.02em]"
                style={{
                  fontFamily: '"Source Serif 4", Georgia, serif',
                  color: "var(--color-text-primary)",
                }}
              >
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {item.text}
              </p>
              <Link
                href={item.href}
                className="mt-5 text-sm font-semibold"
                style={{ color: "#1e3a5f" }}
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
