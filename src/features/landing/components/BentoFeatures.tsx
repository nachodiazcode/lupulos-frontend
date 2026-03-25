"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TiltCard, SectionBadge, GradientText, fadeUp } from "./shared";

/* ═══════════════════════════════════
   Data
   ═══════════════════════════════════ */

interface BentoFeature {
  id: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accentBg: string;
  glowColor: string;
  gridClass: string;
  image?: string;
  decoration?: "avatars" | "ai-pulse";
}

const features: BentoFeature[] = [
  {
    id: "catalog",
    emoji: "🍺",
    title: "1.200 cervezas. Cero humo.",
    description:
      "Cada cerveza artesanal con ficha completa: aromas, maridaje, puntuación real y opiniones sin filtro. Filtra por estilo, cervecería, IBU o lo que se te ocurra. El catálogo craft más honesto de Chile.",
    href: "/cervezas",
    cta: "Abrir el catálogo",
    accentBg: "radial-gradient(ellipse at 88% 88%, rgba(251,191,36,0.12), transparent 65%)",
    glowColor: "rgba(251,191,36,0.12)",
    gridClass: "col-span-12 md:col-span-6",
    image: "/assets/personajes-landing/explorar-cervezas.png",
  },
  {
    id: "map",
    emoji: "📌",
    title: "El mapa cervecero que faltaba",
    description:
      "280+ cervecerías, taprooms y bares craft verificados por la comunidad. Desde el brewpub escondido en Valpo hasta el taproom de montaña en Pucón. Lugares que solo los cerveceros conocen.",
    href: "/lugares",
    cta: "Explorar el mapa",
    accentBg: "radial-gradient(ellipse at 88% 88%, rgba(239,68,68,0.1), transparent 65%)",
    glowColor: "rgba(239,68,68,0.1)",
    gridClass: "col-span-12 md:col-span-6",
    image: "/assets/personajes-landing/encuentra-bares.png",
  },
  {
    id: "community",
    emoji: "💬",
    title: "Tu gente. Tu mesa. Tu voz.",
    description:
      "8.500 cerveceros que comparten hallazgos, debaten estilos y ponen en el mapa a productores que nadie conocía. Aquí no manda un algoritmo — manda la pasión.",
    href: "/posts",
    cta: "Tomar asiento",
    accentBg: "radial-gradient(ellipse at 88% 88%, rgba(52,211,153,0.1), transparent 65%)",
    glowColor: "rgba(52,211,153,0.1)",
    gridClass: "col-span-12 md:col-span-5",
    decoration: "avatars",
  },
  {
    id: "ai",
    emoji: "🧠",
    title: "Una IA que entiende tu paladar",
    description:
      "No es un filtro random. Aprende de cada reseña, cada estrella, cada cerveza que guardas. Te sugiere lo que no sabías que necesitabas — y cada vez acierta más.",
    href: "/auth/register",
    cta: "Probar la IA",
    accentBg: "radial-gradient(ellipse at 88% 88%, rgba(139,92,246,0.12), transparent 65%)",
    glowColor: "rgba(139,92,246,0.12)",
    gridClass: "col-span-12 md:col-span-7",
    decoration: "ai-pulse",
  },
];

const avatarSrcs = [
  "/assets/avatars/ragnar.png",
  "/assets/avatars/Lagertha.png",
  "/assets/avatars/bjorn.png",
];

/* ═══════════════════════════════════
   AI Pulse Decoration
   ═══════════════════════════════════ */

function AiPulse() {
  return (
    <div
      className="pointer-events-none absolute right-7 bottom-7 z-[5] flex items-center justify-center"
      style={{ width: 80, height: 80 }}
      aria-hidden="true"
    >
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 52 + i * 34,
            height: 52 + i * 34,
            borderColor: "rgba(139,92,246,0.35)",
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.08, 0.5] }}
          transition={{
            duration: 2.5 + i * 0.6,
            repeat: Infinity,
            delay: i * 0.65,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Center circle */}
      <div
        className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full"
        style={{
          background: "var(--gradient-button-primary)",
          boxShadow: "0 0 28px rgba(139,92,246,0.35)",
        }}
      >
        <span className="text-xl" role="img" aria-label="IA">🧠</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Card
   ═══════════════════════════════════ */

function BentoCard({ feature, index }: { feature: BentoFeature; index: number }) {
  const hasImage = Boolean(feature.image);
  const isLarge = feature.gridClass.includes("col-span-7");

  return (
    <motion.div
      className={`${feature.gridClass} flex`}
      variants={fadeUp}
      custom={index + 1}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <TiltCard
        className="glass-card group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl p-7"
        style={{
          minHeight: isLarge ? 300 : 270,
        }}
        tiltDeg={6}
        glowColor={feature.glowColor}
      >
        {/* Accent radial gradient */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ background: feature.accentBg }}
          aria-hidden="true"
        />

        {/* Content — constrained width when image is present */}
        <div
          className="relative z-10 flex-1"
          style={{ maxWidth: hasImage ? "60%" : "100%" }}
        >
          <span className="text-4xl" role="img" aria-label={feature.title}>
            {feature.emoji}
          </span>
          <h3 className="text-text-primary mt-3 text-lg font-black leading-snug tracking-tight sm:text-xl">
            {feature.title}
          </h3>
          <p className="text-text-secondary mt-2 text-xs font-semibold leading-relaxed sm:text-sm">
            {feature.description}
          </p>
        </div>

        {/* CTA link */}
        <div className="relative z-10 mt-6">
          <Link
            href={feature.href}
            className="text-amber-primary inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-3"
          >
            {feature.cta}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Decoration: character image */}
        {feature.image && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-[5]"
            style={{ width: "38%", right: "4%" }}
            aria-hidden="true"
          >
            <Image
              src={feature.image}
              alt=""
              fill
              unoptimized
              className="object-contain object-right-center drop-shadow-xl"
              sizes="200px"
            />
          </div>
        )}

        {/* Decoration: community avatars */}
        {feature.decoration === "avatars" && (
          <div className="absolute right-5 bottom-6 z-[5] flex -space-x-3">
            {avatarSrcs.map((src, idx) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 + 0.25, type: "spring", stiffness: 300, damping: 20 }}
              >
                <Image
                  src={src}
                  alt=""
                  width={46}
                  height={46}
                  className="rounded-full border-2 drop-shadow-md"
                  style={{ borderColor: "var(--color-border-amber)", objectFit: "cover" }}
                  aria-hidden="true"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Decoration: AI pulse */}
        {feature.decoration === "ai-pulse" && <AiPulse />}
      </TiltCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   Section
   ═══════════════════════════════════ */

export default function BentoFeatures() {
  return (
    <section
      className="relative py-20 sm:py-24"
      style={{ background: "var(--color-surface-deepest)" }}
      aria-label="Características principales"
    >
      {/* Top separator line */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <SectionBadge>Todo lo que necesitas</SectionBadge>
          <h2 className="text-text-primary mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Por qué 8.500 cerveceros{" "}
            <GradientText>eligieron Lúpulos</GradientText>
          </h2>
          <p className="text-text-muted mx-auto mt-3 max-w-xl text-sm leading-relaxed">
            Catálogo honesto, mapa vivo, comunidad real e inteligencia artificial — conectados para que descubras, compartas y vivas la cerveza artesanal como nunca.
          </p>
        </motion.div>

        {/* Bento grid — Row 1: 7+5 | Row 2: 5+7 */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <BentoCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom separator line */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </section>
  );
}
