"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════
   Hero Character Illustration
   Modern SVG with beer/hops theme
   ═══════════════════════════════════ */

// Hop cone SVG component
const HopCone = ({ 
  size = 50, 
  x = 0, 
  y = 0, 
  delay = 0,
  rotation = 0 
}: { 
  size?: number; 
  x?: number; 
  y?: number; 
  delay?: number;
  rotation?: number;
}) => (
  <motion.g
    transform={`translate(${x}, ${y}) rotate(${rotation})`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
  >
    <motion.g
      animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Hop petals */}
      <ellipse cx={size/2} cy={size*0.2} rx={size*0.2} ry={size*0.28} fill="#84cc16" opacity="0.95" />
      <ellipse cx={size*0.25} cy={size*0.38} rx={size*0.2} ry={size*0.28} fill="#65a30d" transform={`rotate(-25 ${size*0.25} ${size*0.38})`} />
      <ellipse cx={size*0.75} cy={size*0.38} rx={size*0.2} ry={size*0.28} fill="#65a30d" transform={`rotate(25 ${size*0.75} ${size*0.38})`} />
      <ellipse cx={size*0.18} cy={size*0.62} rx={size*0.18} ry={size*0.26} fill="#4d7c0f" transform={`rotate(-40 ${size*0.18} ${size*0.62})`} />
      <ellipse cx={size*0.82} cy={size*0.62} rx={size*0.18} ry={size*0.26} fill="#4d7c0f" transform={`rotate(40 ${size*0.82} ${size*0.62})`} />
      <ellipse cx={size/2} cy={size*0.52} rx={size*0.22} ry={size*0.32} fill="#84cc16" />
      <ellipse cx={size/2} cy={size*0.78} rx={size*0.16} ry={size*0.22} fill="#65a30d" />
      {/* Highlight */}
      <ellipse cx={size*0.38} cy={size*0.35} rx={size*0.06} ry={size*0.1} fill="rgba(255,255,255,0.3)" />
    </motion.g>
  </motion.g>
);

// Main beer mug with foam and bubbles
const BeerMug = () => (
  <motion.g
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {/* Glass body gradient */}
    <defs>
      <linearGradient id="heroGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="heroFoamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fefce8" />
        <stop offset="100%" stopColor="#fef3c7" />
      </linearGradient>
      <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Mug glow */}
    <motion.ellipse
      cx="140"
      cy="180"
      rx="90"
      ry="90"
      fill="rgba(251,191,36,0.15)"
      filter="url(#heroGlow)"
      animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Main glass */}
    <motion.rect
      x="70"
      y="90"
      width="140"
      height="180"
      rx="16"
      fill="url(#heroGlassGradient)"
      animate={{ y: [90, 85, 90] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Glass reflection */}
    <rect x="80" y="100" width="20" height="140" rx="10" fill="rgba(255,255,255,0.25)" />

    {/* Handle */}
    <motion.path
      d="M210 120 Q260 120 260 180 Q260 240 210 240"
      stroke="#b45309"
      strokeWidth="18"
      fill="none"
      strokeLinecap="round"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <path
      d="M210 130 Q245 130 245 180 Q245 230 210 230"
      stroke="#d97706"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />

    {/* Foam base */}
    <motion.ellipse
      cx="140"
      cy="90"
      rx="76"
      ry="22"
      fill="url(#heroFoamGradient)"
      animate={{ y: [90, 85, 90] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Foam bubbles */}
    <motion.circle cx="100" cy="75" r="18" fill="#fefce8" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.circle cx="140" cy="68" r="22" fill="#fffbeb" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} />
    <motion.circle cx="180" cy="72" r="16" fill="#fef9c3" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }} />
    <motion.circle cx="120" cy="60" r="12" fill="white" opacity="0.9" animate={{ y: [0, -2, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }} />
    <motion.circle cx="160" cy="58" r="10" fill="white" opacity="0.85" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />

    {/* Rising bubbles inside glass */}
    {[
      { cx: 100, delay: 0, dur: 2.5, r: 3.5 },
      { cx: 130, delay: 0.8, dur: 3, r: 4 },
      { cx: 160, delay: 0.4, dur: 2.8, r: 3.2 },
      { cx: 180, delay: 1.2, dur: 2.6, r: 4.5 },
      { cx: 115, delay: 1.6, dur: 3.2, r: 3.8 },
    ].map((b, i) => (
      <motion.circle
        key={i}
        cx={b.cx}
        cy="250"
        r={b.r}
        fill="rgba(255,255,255,0.5)"
        animate={{ y: [0, -130], opacity: [0.6, 0] }}
        transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: "easeOut" }}
      />
    ))}
  </motion.g>
);

// Decorative sparkles
const Sparkle = ({ x, y, delay, size = 4 }: { x: number; y: number; delay: number; size?: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={size}
    fill="#fbbf24"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
    transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

// Floating particles
const Particle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={2}
    fill="rgba(251,191,36,0.6)"
    animate={{ y: [y, y - 40, y], opacity: [0, 0.8, 0] }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

export default function HeroCharacterIllustration() {
  return (
    <div className="relative w-full max-w-[360px]">
      <svg
        viewBox="0 0 320 360"
        fill="none"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 18px 44px rgba(180,80,0,0.22))" }}
      >
        {/* Background glow */}
        <motion.circle
          cx="160"
          cy="180"
          r="140"
          fill="rgba(251,191,36,0.08)"
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hops around the mug */}
        <HopCone size={55} x={5} y={40} delay={0.2} rotation={-15} />
        <HopCone size={45} x={260} y={60} delay={0.4} rotation={20} />
        <HopCone size={40} x={20} y={240} delay={0.6} rotation={-25} />
        <HopCone size={50} x={250} y={220} delay={0.3} rotation={30} />
        <HopCone size={35} x={40} y={140} delay={0.8} rotation={-10} />
        <HopCone size={38} x={265} y={150} delay={0.5} rotation={15} />

        {/* Main beer mug */}
        <BeerMug />

        {/* Sparkles */}
        <Sparkle x={50} y={30} delay={0} size={5} />
        <Sparkle x={270} y={45} delay={0.5} size={4} />
        <Sparkle x={30} y={180} delay={1} size={3} />
        <Sparkle x={290} y={190} delay={1.5} size={4} />
        <Sparkle x={60} y={320} delay={0.8} size={3} />
        <Sparkle x={260} y={310} delay={1.2} size={4} />

        {/* Floating particles */}
        <Particle x={80} y={350} delay={0} />
        <Particle x={160} y={340} delay={0.5} />
        <Particle x={240} y={345} delay={1} />
        <Particle x={120} y={355} delay={1.5} />
        <Particle x={200} y={350} delay={2} />
      </svg>

      {/* Text badge */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-2"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(251,191,36,0.3)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="text-sm font-semibold text-amber-300">¡Salud! 🍻</span>
      </motion.div>
    </div>
  );
}
