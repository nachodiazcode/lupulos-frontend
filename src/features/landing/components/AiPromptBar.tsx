"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { api } from "@/lib/api";

/* ═══════════════════════════════════
   Animated AI Sparkle Icon
   ═══════════════════════════════════ */

const ORBIT_PARTICLES = [
  { delay: 0, color: "#fbbf24" },
  { delay: 0.8, color: "#f59e0b" },
  { delay: 1.6, color: "#34d399" },
  { delay: 2.4, color: "#fbbf24" },
];

function AiSparkleIcon({ loading = false, size = 38 }: { loading?: boolean; size?: number }) {
  const r = size / 2;
  const orbitR = r - 4;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          boxShadow: [
            "0 0 0px 0px rgba(251,191,36,0.0)",
            "0 0 12px 3px rgba(251,191,36,0.25)",
            "0 0 0px 0px rgba(251,191,36,0.0)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting sparkle particles */}
      {ORBIT_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 5,
            height: 5,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            left: r - 2.5,
            top: r - 2.5,
          }}
          animate={{
            x: [
              Math.cos(0) * orbitR,
              Math.cos(Math.PI * 0.5) * orbitR,
              Math.cos(Math.PI) * orbitR,
              Math.cos(Math.PI * 1.5) * orbitR,
              Math.cos(Math.PI * 2) * orbitR,
            ],
            y: [
              Math.sin(0) * orbitR,
              Math.sin(Math.PI * 0.5) * orbitR,
              Math.sin(Math.PI) * orbitR,
              Math.sin(Math.PI * 1.5) * orbitR,
              Math.sin(Math.PI * 2) * orbitR,
            ],
            scale: [0.8, 1.2, 0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5, 1, 0.5],
          }}
          transition={{
            duration: loading ? 1.5 : 4,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}

      {/* Center icon body */}
      <motion.div
        className="absolute inset-[5px] flex items-center justify-center rounded-lg"
        style={{ background: "var(--gradient-button-primary)" }}
        animate={loading ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={loading ? { duration: 0.8, repeat: Infinity } : {}}
      >
        {/* AI 4-pointed star */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            style={{ fill: "var(--color-text-dark)", opacity: 0.75, transformOrigin: "12px 12px" }}
            animate={{ rotate: loading ? [0, 180] : [0, 360] }}
            transition={{ duration: loading ? 1 : 8, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner dot */}
          <motion.circle
            cx="12" cy="12" r="2"
            style={{ fill: "var(--color-text-dark)", opacity: 0.4 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════
   Gradient Border Wrapper
   ═══════════════════════════════════ */

function LiquidGlassBorder({
  children,
  active = false,
  radius = 28,
  borderWidth = 2,
}: {
  children: React.ReactNode;
  active?: boolean;
  radius?: number;
  borderWidth?: number;
}) {
  const rotation = useMotionValue(0);

  useEffect(() => {
    const ctrl = animate(rotation, 360, {
      duration: 3.5,
      repeat: Infinity,
      ease: "linear",
    });
    return () => ctrl.stop();
  }, [rotation]);

  const conicBg = useTransform(
    rotation,
    (r) =>
      `conic-gradient(from ${r}deg, #fbbf24, #f59e0b, #34d399, #60a5fa, #a78bfa, #f472b6, #f59e0b, #fbbf24)`,
  );

  return (
    <motion.div
      className="relative"
      style={{ borderRadius: radius, padding: borderWidth }}
      animate={active ? { scale: [1, 1.008, 1] } : { scale: 1 }}
      transition={active ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      {/* Rotating gradient border */}
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          background: conicBg,
          opacity: active ? 1 : 0.55,
          transition: "opacity 0.4s",
        }}
      />

      {/* Outer glow — más dramático */}
      <motion.div
        className="absolute -inset-1"
        style={{
          borderRadius: radius + 4,
          background: conicBg,
          filter: "blur(18px)",
          opacity: active ? 0.4 : 0.12,
          transition: "opacity 0.4s",
        }}
      />

      {/* Pulsing warm glow */}
      <motion.div
        className="pointer-events-none absolute -inset-3"
        style={{
          borderRadius: radius + 12,
          background: "radial-gradient(ellipse, rgba(251,191,36,0.15) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content — liquid glass */}
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: radius - borderWidth }}
      >
        {children}

        {/* Shimmer — luz que recorre la superficie */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius - borderWidth,
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 45%, rgba(255,240,200,0.08) 50%, transparent 65%)",
            backgroundSize: "250% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0%", "-100% 0%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
        />

        {/* Glass reflection — brillo superior */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: "50%",
            borderRadius: `${radius - borderWidth}px ${radius - borderWidth}px 0 0`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   Typewriter placeholder
   ═══════════════════════════════════ */

const AI_PLACEHOLDER_HINTS = [
  "¿Qué cerveza va bien con un asado? 🔥",
  "Recomiéndame una IPA frutal y aromática...",
  "Busco una cerveza suave para el verano ☀️",
  "¿Cuál es la mejor Stout con notas de café?",
  "Quiero probar algo nuevo, sorpréndeme...",
];

function useTypewriter(phrases: string[], speed = 50, pause = 2200, deleteSpeed = 30) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];
    if (!isDeleting && text === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const delta = isDeleting ? deleteSpeed : speed;
      timeoutRef.current = setTimeout(() => {
        setText((prev) =>
          isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
        );
      }, delta);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [text, phraseIndex, isDeleting, phrases, speed, pause, deleteSpeed]);

  return text;
}

/* ═══════════════════════════════════
   Suggestions + local answers
   ═══════════════════════════════════ */

const suggestions = [
  { label: "¿Para qué sirve?", icon: "🍺", full: "¿Para qué sirve esta app?" },
  { label: "¿Qué es Lúpulos?", icon: "🌿", full: "¿Qué es Lúpulos?" },
  { label: "Beneficios", icon: "✨", full: "¿Qué beneficios tiene?" },
  { label: "Buscar cervezas", icon: "🔍", full: "¿Cómo encuentro cervezas?" },
  { label: "Agregar lugares", icon: "📍", full: "¿Puedo agregar lugares?" },
];

const localAnswers: Record<string, string> = {
  "¿Para qué sirve esta app?":
    "Lúpulos App es tu compañera cervecera: descubre cervezas artesanales, encuentra bares y brewpubs cerca de ti, publica reseñas con fotos y conecta con una comunidad apasionada por el lúpulo. ¡Es como el Airbnb de la cerveza artesanal! 🍻",
  "¿Qué es Lúpulos?":
    "Lúpulos es la comunidad cervecera #1 de Chile. Una plataforma donde los amantes de la cerveza artesanal pueden explorar un catálogo colaborativo de cervezas, descubrir lugares cerveceros y compartir experiencias con otros fans. 🌿",
  "¿Qué beneficios tiene?":
    "Con Lúpulos puedes: explorar cientos de cervezas con reseñas y puntuaciones, encontrar bares y brewpubs en un mapa interactivo, publicar tus descubrimientos, seguir a otros cerveceros y recibir recomendaciones personalizadas. ¡Todo gratis! ✨",
  "¿Cómo encuentro cervezas?":
    "Ve a la sección 'Cervezas' en el menú principal. Puedes filtrar por estilo (IPA, Stout, Lager...), cervecería, puntuación y más. Cada cerveza tiene su ficha con notas de cata, fotos y reseñas de la comunidad. 🔍",
  "¿Puedo agregar lugares?":
    "¡Claro! Regístrate y podrás agregar bares, brewpubs, tiendas de cerveza y cualquier lugar cervecero. Solo necesitas el nombre, dirección y una foto. La comunidad se encargará de enriquecerlo con reseñas. 📍",
};

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function AiPromptBar() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;
    setQuery(question);
    setExpanded(true);
    setLoading(true);
    setAnswer("");

    const local = localAnswers[question];
    if (local) {
      await new Promise((r) => setTimeout(r, 600));
      setAnswer(local);
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      await new Promise((r) => setTimeout(r, 400));
      setAnswer(
        "¡Regístrate o inicia sesión para hacerme preguntas personalizadas! Mientras tanto, prueba las sugerencias de abajo. 🍺",
      );
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/chat/ai/query", { query: question });
      const payload = res.data?.data || {};
      setAnswer(payload.answer || "No encontré resultados por ahora. ¡Intenta con otra pregunta!");
    } catch {
      setAnswer("No pude responder ahora. ¡Intenta de nuevo más tarde!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(query);
  };

  const handleSuggestion = (full: string) => {
    setQuery(full);
    void ask(full);
  };

  const handleClose = () => {
    setExpanded(false);
    setAnswer("");
    setQuery("");
  };

  const [focused, setFocused] = useState(false);
  const typedPlaceholder = useTypewriter(AI_PLACEHOLDER_HINTS);

  /* 3D tilt on mouse move */
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const formRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(y * -6);
    tiltY.set(x * 8);
  };

  const handleMouseLeave = () => {
    animate(tiltX, 0, { duration: 0.4 });
    animate(tiltY, 0, { duration: 0.4 });
  };

  return (
    <div className="relative z-20 w-full">
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-3">
        {/* ─── Prompt bar with rotating gradient border ─── */}
        <motion.div
          ref={formRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 800, rotateX: tiltX, rotateY: tiltY }}
        >
        <form onSubmit={handleSubmit}>
          <LiquidGlassBorder active={focused || expanded || loading} radius={32} borderWidth={2.5}>
            <div
              className="flex items-center gap-3.5 px-5 py-4"
              style={{
                background: "var(--color-surface-card)",
                borderRadius: 29.5,
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              }}
            >
              <AiSparkleIcon loading={loading} size={42} />

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full bg-transparent text-base font-bold outline-none"
                  style={{ color: "var(--color-text-primary)" }}
                />
                {/* Typewriter placeholder */}
                {!query && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center text-base font-semibold"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <span>{typedPlaceholder}</span>
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
                      className="ml-px inline-block h-5 w-[2.5px] rounded-full"
                      style={{ background: "linear-gradient(180deg, #a78bfa, #f59e0b)" }}
                    />
                  </div>
                )}
              </div>

              {/* Send button */}
              <AnimatePresence mode="wait">
                {query.trim() && (
                  <motion.button
                    key="send"
                    type="submit"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </LiquidGlassBorder>
        </form>
        </motion.div>

        {/* ─── Suggestion chips ─── */}
        <AnimatePresence>
          {!expanded && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-2.5 flex flex-wrap justify-center gap-1.5"
            >
              {suggestions.map((s, i) => (
                <motion.button
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestion(s.full)}
                  className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200 hover:border-amber-primary/30"
                  style={{
                    background: "var(--color-surface-elevated)",
                    borderColor: "var(--color-border-subtle)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span className="text-xs">{s.icon}</span>
                  {s.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Answer area ─── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <LiquidGlassBorder active={loading} radius={24} borderWidth={2}>
                <div
                  className="p-5"
                  style={{
                    background: "var(--color-surface-card)",
                    borderRadius: 22,
                    backdropFilter: "blur(24px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                  }}
                >
                  {/* Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AiSparkleIcon loading={loading} size={30} />
                      <div>
                        <span className="text-xs font-semibold text-amber-primary">Lúpulos AI</span>
                        <span className="ml-2 text-[10px] text-text-muted">
                          {loading ? "pensando..." : "respuesta"}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-7 w-7 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-border-subtle hover:text-text-primary"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Response */}
                  {loading ? (
                    <div className="flex items-center gap-3 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 rounded-full bg-amber-primary"
                          animate={{
                            width: [12, 24, 12],
                            opacity: [0.3, 0.7, 0.3],
                          }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm leading-relaxed text-text-secondary"
                    >
                      {answer}
                    </motion.p>
                  )}

                  {/* Follow-up chips */}
                  {!loading && answer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 flex flex-wrap gap-1.5 border-t pt-3"
                      style={{ borderColor: "var(--color-border-subtle)" }}
                    >
                      {suggestions
                        .filter((s) => s.full !== query)
                        .slice(0, 3)
                        .map((s) => (
                          <button
                            key={s.label}
                            onClick={() => handleSuggestion(s.full)}
                            className="rounded-xl border px-2.5 py-1 text-[10px] text-text-muted transition-all hover:border-amber-primary/30 hover:text-text-secondary"
                            style={{ borderColor: "var(--color-border-subtle)" }}
                          >
                            {s.icon} {s.label}
                          </button>
                        ))}
                    </motion.div>
                  )}
                </div>
              </LiquidGlassBorder>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
