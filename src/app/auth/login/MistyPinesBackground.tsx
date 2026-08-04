"use client";

import React from "react";
import { motion } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────
   LUPULØS · misty-pines
   Valle de pinos al amanecer. God rays dorados, capas de niebla y brasas
   flotando. Atmosférico, cinematográfico y premium tipo Linear/Vercel.

   Disciplina de composición:
   - El DRAMA vive arriba (haces de luz) y en los BORDES (pinos, niebla).
   - La zona centro-derecha (donde va la CARD, ~56%–96%) queda tranquila:
     un radial cálido suave la mantiene legible sin texturas que compitan.
   - SSR-safe: cero Math.random()/Date.now(). Posiciones deterministas
     escritas a mano. Pocas capas SVG + blur, todo GPU-friendly.
   ──────────────────────────────────────────────────────────────────────── */

/* Siluetas de pinos precomputadas (deterministas). Cada pino: cx base,
   ancho de la base, altura, y semilla de seed para variar la copa. */
type Pine = { cx: number; base: number; h: number; tiers: number };

const PINES_IZQ: Pine[] = [
  { cx: 60, base: 150, h: 430, tiers: 5 },
  { cx: 165, base: 120, h: 360, tiers: 5 },
  { cx: 250, base: 165, h: 480, tiers: 6 },
  { cx: 350, base: 110, h: 330, tiers: 4 },
];

const PINES_DER: Pine[] = [
  { cx: 1440, base: 160, h: 470, tiers: 6 },
  { cx: 1330, base: 120, h: 360, tiers: 5 },
  { cx: 1230, base: 150, h: 420, tiers: 5 },
];

/* Brasas flotando: posición fija + retardo/duración fijos (deterministas). */
const BRASAS = [
  { x: 120, y: 540, r: 2.4, dur: 11, delay: 0.0, drift: 26 },
  { x: 240, y: 610, r: 1.6, dur: 14, delay: 1.6, drift: -18 },
  { x: 330, y: 470, r: 2.0, dur: 12, delay: 3.1, drift: 22 },
  { x: 90, y: 660, r: 1.4, dur: 16, delay: 0.8, drift: 14 },
  { x: 410, y: 580, r: 1.8, dur: 13, delay: 2.3, drift: -24 },
  { x: 1310, y: 560, r: 2.2, dur: 12, delay: 0.4, drift: -20 },
  { x: 1400, y: 640, r: 1.5, dur: 15, delay: 2.0, drift: 16 },
  { x: 1240, y: 500, r: 1.9, dur: 13, delay: 3.6, drift: 24 },
  { x: 1455, y: 600, r: 1.3, dur: 17, delay: 1.1, drift: -12 },
];

/* Construye la silueta de un pino como un path de "escalones" (tiers). */
function pinePath({ cx, base, h, tiers }: Pine, groundY: number): string {
  const topY = groundY - h;
  const trunkW = base * 0.12;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const tierTopY = topY + (h * 0.92) * t;
    const tierBotY = topY + (h * 0.92) * ((i + 1) / tiers);
    const halfTop = (base / 2) * (0.16 + 0.84 * t);
    const halfBot = (base / 2) * (0.16 + 0.84 * (i + 1) / tiers);
    if (i === 0) {
      left.push(`M ${cx} ${topY}`);
      left.push(`L ${cx - halfTop} ${tierBotY}`);
    } else {
      left.push(`L ${cx - halfTop * 0.62} ${tierTopY}`);
      left.push(`L ${cx - halfBot} ${tierBotY}`);
    }
    right.unshift(`L ${cx + halfBot} ${tierBotY}`);
    right.unshift(`L ${cx + halfTop * 0.62} ${tierTopY}`);
  }
  // tronco
  const base2 = groundY;
  left.push(`L ${cx - trunkW} ${base2}`);
  right.unshift(`L ${cx + trunkW} ${base2}`);
  right.unshift(`L ${cx + (base / 2)} ${groundY - h * 0.08}`);
  left.push(`L ${cx - (base / 2)} ${groundY - h * 0.08}`);
  return [...left, ...right, "Z"].join(" ");
}

const GROUND = 760;

export default function MistyPinesBackground({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(120% 90% at 18% 8%, #2a1605 0%, #1c0e02 38%, #140902 64%, #0e0601 100%)",
        pointerEvents: "none",
      }}
    >
      {/* ── Capa base SVG: cielo dorado, god rays, valle y pinos ───────── */}
      <svg
        viewBox="0 0 1512 860"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          {/* Resplandor del amanecer, anclado arriba-izquierda */}
          <radialGradient id="mp-dawn" cx="20%" cy="2%" r="85%">
            <stop offset="0%" stopColor="#fff1c0" stopOpacity="0.95" />
            <stop offset="14%" stopColor="#f3c45a" stopOpacity="0.7" />
            <stop offset="34%" stopColor="#c4901c" stopOpacity="0.38" />
            <stop offset="62%" stopColor="#6b3d08" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0e0601" stopOpacity="0" />
          </radialGradient>

          {/* Halo cálido de "calma" tras la card (centro-derecha): muy sutil,
              sólo para asentar el contraste del formulario, sin textura. */}
          <radialGradient id="mp-calm" cx="74%" cy="52%" r="48%">
            <stop offset="0%" stopColor="#3a2207" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#1c0e02" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1c0e02" stopOpacity="0" />
          </radialGradient>

          {/* Gradiente de un haz de luz volumétrico */}
          <linearGradient id="mp-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#f0bf52" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#f0bf52" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="mp-pine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0d07" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#040301" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="mp-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#caa766" stopOpacity="0" />
            <stop offset="55%" stopColor="#b89a6b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9a814f" stopOpacity="0.85" />
          </linearGradient>

          {/* Niebla orgánica con feTurbulence (una sola textura procedural) */}
          <filter id="mp-mist" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.05"
              numOctaves={2}
              seed={7}
              result="n"
            />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.72  0 0 0 0 0.6  0 0 0 0 0.36  0 0 0 0.6 0"
            />
            <feGaussianBlur stdDeviation="9" />
          </filter>

          <filter id="mp-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>

          {/* Viñeta de bordes para encajonar la mirada hacia el centro */}
          <radialGradient id="mp-vig" cx="50%" cy="44%" r="72%">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Resplandor del amanecer */}
        <rect x="0" y="0" width="1512" height="860" fill="url(#mp-dawn)" />

        {/* ── God rays: pocos haces, anchos, lentos. Sólo a la izquierda
             y centro-arriba para no invadir la card. ─────────────────── */}
        <g style={{ mixBlendMode: "screen" }} filter="url(#mp-soft)">
          <motion.g
            initial={{ opacity: 0.55 }}
            animate={{ opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "300px 0px" }}
          >
            <polygon points="180,-40 360,-40 250,720 60,720" fill="url(#mp-ray)" />
            <polygon points="430,-40 560,-40 520,700 330,700" fill="url(#mp-ray)" />
          </motion.g>
          <motion.g
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={{ transformOrigin: "650px 0px" }}
          >
            <polygon points="640,-40 760,-40 740,640 560,640" fill="url(#mp-ray)" />
            <polygon points="820,-40 900,-40 940,560 760,560" fill="url(#mp-ray)" />
          </motion.g>
        </g>

        {/* Niebla de fondo media (procedural), atenuada hacia el centro */}
        <motion.rect
          x="-60"
          y="430"
          width="1632"
          height="430"
          filter="url(#mp-mist)"
          initial={{ x: -60 }}
          animate={{ x: [-60, 20, -60] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          opacity={0.5}
        />

        {/* Pinos (siluetas) — bordes izquierdo y derecho */}
        <g fill="url(#mp-pine)">
          {PINES_IZQ.map((p, i) => (
            <path key={`l${i}`} d={pinePath(p, GROUND)} />
          ))}
          {PINES_DER.map((p, i) => (
            <path key={`r${i}`} d={pinePath(p, GROUND)} />
          ))}
        </g>

        {/* Banco de niebla baja que envuelve las bases de los pinos */}
        <motion.rect
          x="0"
          y="600"
          width="1512"
          height="260"
          fill="url(#mp-fog)"
          filter="url(#mp-soft)"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Halo de calma tras la card + viñeta */}
        <rect x="0" y="0" width="1512" height="860" fill="url(#mp-calm)" />
        <rect x="0" y="0" width="1512" height="860" fill="url(#mp-vig)" />
      </svg>

      {/* ── Brasas flotando (capa ligera, sólo a los lados) ───────────── */}
      <svg
        viewBox="0 0 1512 860"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "screen",
        }}
      >
        {BRASAS.map((b, i) => (
          <motion.circle
            key={i}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill="#ffd56a"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
              y: [0, -220],
              x: [0, b.drift, 0],
            }}
            transition={{
              duration: b.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: b.delay,
            }}
          />
        ))}
      </svg>

      {/* Velo superior para fundir todo y reforzar la calma de la card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(14,6,1,0) 38%, rgba(20,10,3,0.35) 70%, rgba(20,10,3,0.55) 100%)",
        }}
      />
    </div>
  );
}
