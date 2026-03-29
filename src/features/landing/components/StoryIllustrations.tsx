"use client";

import { motion } from "framer-motion";
import { ComponentType } from "react";

/* ═══════════════════════════════════
   Story Section Illustrations
   4 themed SVG illustrations
   ═══════════════════════════════════ */

interface IllustrationProps {
  className?: string;
}

/* ─── 1. Explorar Cervezas - Beer bottles & flavors ─── */
export const ExploreCervezasIllustration: ComponentType<IllustrationProps> = ({ className }) => (
  <div className={`relative w-full max-w-[300px] ${className || ""}`}>
    <svg viewBox="0 0 300 280" fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="bottle1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="bottle2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="bottle3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Glow background */}
      <motion.circle
        cx="150"
        cy="140"
        r="100"
        fill="rgba(251,191,36,0.1)"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Bottle 1 - Left (Amber) */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          {/* Bottle body */}
          <rect x="60" y="100" width="50" height="130" rx="8" fill="url(#bottle1)" />
          {/* Neck */}
          <rect x="72" y="70" width="26" height="35" rx="4" fill="url(#bottle1)" />
          {/* Cap */}
          <rect x="70" y="60" width="30" height="14" rx="4" fill="#92400e" />
          {/* Label */}
          <rect x="65" y="130" width="40" height="50" rx="4" fill="rgba(255,255,255,0.9)" />
          <rect x="70" y="140" width="30" height="4" rx="2" fill="#d97706" />
          <rect x="70" y="150" width="20" height="3" rx="1" fill="#fbbf24" opacity="0.7" />
          {/* Reflection */}
          <rect x="65" y="105" width="8" height="80" rx="4" fill="rgba(255,255,255,0.2)" />
        </motion.g>
      </motion.g>

      {/* Bottle 2 - Center (Purple) */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.g animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
          <rect x="125" y="80" width="50" height="150" rx="8" fill="url(#bottle2)" />
          <rect x="137" y="50" width="26" height="35" rx="4" fill="url(#bottle2)" />
          <rect x="135" y="40" width="30" height="14" rx="4" fill="#5b21b6" />
          <rect x="130" y="115" width="40" height="55" rx="4" fill="rgba(255,255,255,0.9)" />
          <rect x="135" y="125" width="30" height="4" rx="2" fill="#7c3aed" />
          <rect x="135" y="135" width="25" height="3" rx="1" fill="#a78bfa" opacity="0.7" />
          <rect x="135" y="145" width="18" height="3" rx="1" fill="#a78bfa" opacity="0.5" />
          <rect x="130" y="85" width="8" height="100" rx="4" fill="rgba(255,255,255,0.2)" />
        </motion.g>
      </motion.g>

      {/* Bottle 3 - Right (Green) */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.3 }}>
          <rect x="190" y="110" width="50" height="120" rx="8" fill="url(#bottle3)" />
          <rect x="202" y="80" width="26" height="35" rx="4" fill="url(#bottle3)" />
          <rect x="200" y="70" width="30" height="14" rx="4" fill="#047857" />
          <rect x="195" y="140" width="40" height="45" rx="4" fill="rgba(255,255,255,0.9)" />
          <rect x="200" y="150" width="30" height="4" rx="2" fill="#10b981" />
          <rect x="200" y="160" width="22" height="3" rx="1" fill="#34d399" opacity="0.7" />
          <rect x="195" y="115" width="8" height="70" rx="4" fill="rgba(255,255,255,0.2)" />
        </motion.g>
      </motion.g>

      {/* Floating flavor notes */}
      {[
        { emoji: "🍋", x: 40, y: 50, delay: 0 },
        { emoji: "🫐", x: 110, y: 25, delay: 0.5 },
        { emoji: "🌿", x: 180, y: 35, delay: 1 },
        { emoji: "🍊", x: 250, y: 55, delay: 0.8 },
        { emoji: "🌶️", x: 260, y: 180, delay: 1.2 },
      ].map((note, i) => (
        <motion.text
          key={i}
          x={note.x}
          y={note.y}
          fontSize="20"
          animate={{ y: [note.y, note.y - 10, note.y], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, delay: note.delay }}
        >
          {note.emoji}
        </motion.text>
      ))}

      {/* Stars */}
      {[
        { x: 30, y: 100, delay: 0 },
        { x: 270, y: 120, delay: 0.5 },
        { x: 50, y: 220, delay: 1 },
        { x: 250, y: 240, delay: 0.8 },
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={3}
          fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </svg>
  </div>
);

/* ─── 2. Encuentra Bares - Map pin & building ─── */
export const EncuentraBaresIllustration: ComponentType<IllustrationProps> = ({ className }) => (
  <div className={`relative w-full max-w-[300px] ${className || ""}`}>
    <svg viewBox="0 0 300 280" fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="pin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="building" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <motion.circle
        cx="150"
        cy="150"
        r="100"
        fill="rgba(239,68,68,0.1)"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Building */}
      <motion.g
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <rect x="80" y="120" width="140" height="130" rx="8" fill="url(#building)" />
        {/* Windows */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <motion.rect
              key={`${row}-${col}`}
              x={95 + col * 32}
              y={135 + row * 35}
              width="22"
              height="25"
              rx="3"
              fill="#fbbf24"
              opacity={0.8}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: (row + col) * 0.2 }}
            />
          ))
        )}
        {/* Door */}
        <rect x="130" y="200" width="40" height="50" rx="4" fill="#0f172a" />
        <rect x="135" y="205" width="30" height="40" rx="2" fill="#fbbf24" opacity="0.3" />
        {/* Sign */}
        <rect x="110" y="105" width="80" height="20" rx="4" fill="#f97316" />
        <motion.rect
          x="120"
          y="110"
          width="60"
          height="10"
          rx="2"
          fill="rgba(255,255,255,0.9)"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>

      {/* Map pin */}
      <motion.g
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M150 30 C120 30 100 55 100 80 C100 110 150 150 150 150 C150 150 200 110 200 80 C200 55 180 30 150 30Z"
            fill="url(#pin)"
          />
          <circle cx="150" cy="75" r="22" fill="white" />
          <text x="150" y="82" textAnchor="middle" fontSize="20">🍺</text>
          {/* Shadow */}
          <motion.ellipse
            cx="150"
            cy="155"
            rx="25"
            ry="8"
            fill="rgba(0,0,0,0.2)"
            animate={{ scale: [1, 0.8, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>
      </motion.g>

      {/* Pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="150"
          cy="75"
          r="30"
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}

      {/* Distance indicators */}
      <motion.text
        x="50"
        y="200"
        fill="#94a3b8"
        fontSize="12"
        fontWeight="500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        500m
      </motion.text>
      <motion.text
        x="230"
        y="180"
        fill="#94a3b8"
        fontSize="12"
        fontWeight="500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        1.2km
      </motion.text>
    </svg>
  </div>
);

/* ─── 3. Comunidad - Connected users ─── */
export const ComunidadIllustration: ComponentType<IllustrationProps> = ({ className }) => (
  <div className={`relative w-full max-w-[300px] ${className || ""}`}>
    <svg viewBox="0 0 300 280" fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="user1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="user2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="user3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Center glow */}
      <motion.circle
        cx="150"
        cy="140"
        r="90"
        fill="rgba(16,185,129,0.08)"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Connection lines */}
      <motion.line
        x1="80" y1="100" x2="150" y2="140"
        stroke="rgba(16,185,129,0.4)"
        strokeWidth="2"
        strokeDasharray="5 5"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.line
        x1="220" y1="100" x2="150" y2="140"
        stroke="rgba(59,130,246,0.4)"
        strokeWidth="2"
        strokeDasharray="5 5"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.line
        x1="150" y1="220" x2="150" y2="140"
        stroke="rgba(249,115,22,0.4)"
        strokeWidth="2"
        strokeDasharray="5 5"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      <motion.line
        x1="80" y1="100" x2="220" y2="100"
        stroke="rgba(251,191,36,0.3)"
        strokeWidth="1"
        strokeDasharray="4 4"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* User 1 - Top Left */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <circle cx="80" cy="100" r="35" fill="url(#user1)" />
          <circle cx="80" cy="90" r="14" fill="#fef3c7" />
          <ellipse cx="80" cy="115" rx="18" ry="12" fill="#fef3c7" />
          {/* Chat bubble */}
          <motion.g
            animate={{ opacity: [0, 1, 1, 0], y: [0, -5, -5, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            <rect x="100" y="55" width="50" height="25" rx="12" fill="white" />
            <text x="125" y="72" textAnchor="middle" fontSize="14">🍻 Salud!</text>
          </motion.g>
        </motion.g>
      </motion.g>

      {/* User 2 - Top Right */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
          <circle cx="220" cy="100" r="35" fill="url(#user2)" />
          <circle cx="220" cy="90" r="14" fill="#fef3c7" />
          <ellipse cx="220" cy="115" rx="18" ry="12" fill="#fef3c7" />
          <motion.g
            animate={{ opacity: [0, 1, 1, 0], y: [0, -5, -5, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          >
            <rect x="170" y="55" width="40" height="25" rx="12" fill="white" />
            <text x="190" y="72" textAnchor="middle" fontSize="14">⭐⭐⭐</text>
          </motion.g>
        </motion.g>
      </motion.g>

      {/* User 3 - Bottom */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
      >
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.3 }}>
          <circle cx="150" cy="220" r="35" fill="url(#user3)" />
          <circle cx="150" cy="210" r="14" fill="#fef3c7" />
          <ellipse cx="150" cy="235" rx="18" ry="12" fill="#fef3c7" />
          <motion.g
            animate={{ opacity: [0, 1, 1, 0], y: [0, -5, -5, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3.5 }}
          >
            <rect x="165" y="185" width="55" height="25" rx="12" fill="white" />
            <text x="193" y="202" textAnchor="middle" fontSize="12">Nueva IPA!</text>
          </motion.g>
        </motion.g>
      </motion.g>

      {/* Center hub */}
      <motion.circle
        cx="150"
        cy="140"
        r="25"
        fill="#fbbf24"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <text x="150" y="147" textAnchor="middle" fontSize="22">🍺</text>

      {/* Floating hearts/reactions */}
      {[
        { emoji: "❤️", x: 60, y: 160, delay: 0 },
        { emoji: "🔥", x: 240, y: 150, delay: 1 },
        { emoji: "💬", x: 100, y: 45, delay: 0.5 },
        { emoji: "🎉", x: 200, y: 260, delay: 1.5 },
      ].map((item, i) => (
        <motion.text
          key={i}
          x={item.x}
          y={item.y}
          fontSize="16"
          animate={{ y: [item.y, item.y - 15, item.y], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
        >
          {item.emoji}
        </motion.text>
      ))}
    </svg>
  </div>
);

/* ─── 4. Team/Unirse - Cheers illustration ─── */
export const TeamIllustration: ComponentType<IllustrationProps> = ({ className }) => (
  <div className={`relative w-full max-w-[300px] ${className || ""}`}>
    <svg viewBox="0 0 300 280" fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="mug1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mug2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Celebration burst */}
      <motion.circle
        cx="150"
        cy="130"
        r="100"
        fill="rgba(251,191,36,0.1)"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Left mug */}
      <motion.g
        initial={{ x: -30, rotate: -20, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.g
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          style={{ transformOrigin: "100px 200px" }}
        >
          <rect x="50" y="100" width="80" height="120" rx="10" fill="url(#mug1)" />
          <path d="M130 130 Q165 130 165 165 Q165 200 130 200" stroke="#b45309" strokeWidth="12" fill="none" strokeLinecap="round" />
          <ellipse cx="90" cy="100" rx="44" ry="14" fill="#fef3c7" />
          <circle cx="70" cy="90" r="10" fill="#fefce8" />
          <circle cx="90" cy="85" r="12" fill="white" opacity="0.9" />
          <circle cx="110" cy="88" r="9" fill="#fef9c3" />
          <rect x="55" y="110" width="12" height="80" rx="6" fill="rgba(255,255,255,0.2)" />
          {/* Bubbles */}
          <motion.circle cx="70" cy="190" r="3" fill="rgba(255,255,255,0.5)" animate={{ y: [0, -70], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="100" cy="185" r="2" fill="rgba(255,255,255,0.5)" animate={{ y: [0, -60], opacity: [0.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        </motion.g>
      </motion.g>

      {/* Right mug */}
      <motion.g
        initial={{ x: 30, rotate: 20, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.g
          animate={{ rotate: [0, -15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          style={{ transformOrigin: "200px 200px" }}
        >
          <rect x="170" y="100" width="80" height="120" rx="10" fill="url(#mug2)" />
          <path d="M170 130 Q135 130 135 165 Q135 200 170 200" stroke="#92400e" strokeWidth="12" fill="none" strokeLinecap="round" />
          <ellipse cx="210" cy="100" rx="44" ry="14" fill="#fef3c7" />
          <circle cx="190" cy="88" r="11" fill="#fefce8" />
          <circle cx="210" cy="84" r="13" fill="white" opacity="0.9" />
          <circle cx="230" cy="90" r="8" fill="#fef9c3" />
          <rect x="175" y="110" width="12" height="80" rx="6" fill="rgba(255,255,255,0.2)" />
          <motion.circle cx="190" cy="188" r="2.5" fill="rgba(255,255,255,0.5)" animate={{ y: [0, -65], opacity: [0.5, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="220" cy="192" r="3" fill="rgba(255,255,255,0.5)" animate={{ y: [0, -75], opacity: [0.5, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.8 }} />
        </motion.g>
      </motion.g>

      {/* Clink effect */}
      <motion.g
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <circle cx="150" cy="95" r="5" fill="#fbbf24" />
        <line x1="150" y1="70" x2="150" y2="55" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="80" x2="120" y2="70" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <line x1="170" y1="80" x2="180" y2="70" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Confetti */}
      {[
        { x: 40, y: 50, color: "#fbbf24", delay: 0 },
        { x: 260, y: 60, color: "#ef4444", delay: 0.3 },
        { x: 80, y: 30, color: "#10b981", delay: 0.6 },
        { x: 220, y: 40, color: "#3b82f6", delay: 0.9 },
        { x: 150, y: 25, color: "#a855f7", delay: 0.4 },
        { x: 30, y: 180, color: "#f97316", delay: 1.2 },
        { x: 270, y: 190, color: "#fbbf24", delay: 0.7 },
      ].map((c, i) => (
        <motion.rect
          key={i}
          x={c.x}
          y={c.y}
          width="8"
          height="8"
          rx="2"
          fill={c.color}
          animate={{ y: [c.y, c.y + 50], rotate: [0, 360], opacity: [1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: c.delay }}
        />
      ))}

      {/* Text */}
      <motion.text
        x="150"
        y="265"
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="18"
        fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        ¡Únete al brindis!
      </motion.text>
    </svg>
  </div>
);

// Map for easy access
export const StoryIllustrations = {
  "explorar-cervezas": ExploreCervezasIllustration,
  "encuentra-bares": EncuentraBaresIllustration,
  "comunidad": ComunidadIllustration,
  "team": TeamIllustration,
} as const;

export type StoryIllustrationType = keyof typeof StoryIllustrations;
