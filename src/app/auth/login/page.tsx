"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Snackbar, Alert } from "@mui/material";
import useAuth from "@/hooks/useAuth";
import { GOOGLE_AUTH_URL } from "@/lib/constants";
import api from "@/lib/api";
import { persistAuthSession } from "@/lib/auth-storage";
import {
  extractAuthSession,
  normalizeProfilePayload,
  normalizeStoredAuthUser,
} from "@/lib/auth-user";
import { getErrorMessage } from "@/lib/errors";

const LOGIN_THEME = {
  accent: "var(--color-amber-primary)",
  accentHover: "var(--color-amber-hover)",
  accentGradient: "var(--gradient-button-primary)",
  headingGradient: "var(--gradient-heading, var(--gradient-button-primary))",
  buttonText: "var(--color-text-dark)",
  panelGradient: "var(--gradient-card-glass)",
  panelSurface: "color-mix(in srgb, var(--color-surface-card) 94%, var(--color-surface-elevated) 6%)",
  fieldSurface: "color-mix(in srgb, var(--color-surface-card) 96%, var(--color-surface-elevated) 4%)",
  buttonSurface: "color-mix(in srgb, var(--color-surface-card) 94%, var(--color-surface-overlay) 6%)",
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  border: "var(--color-border-light)",
  borderAccent: "color-mix(in srgb, var(--color-border-amber) 48%, var(--color-border-light))",
  borderHighlight: "color-mix(in srgb, var(--color-amber-light) 18%, var(--color-border-light))",
  shadow: "var(--shadow-elevated)",
  glow: "var(--shadow-amber-glow)",
  glowLarge: "var(--shadow-amber-glow-lg)",
  errorBg: "color-mix(in srgb, var(--color-error) 12%, var(--color-surface-card) 88%)",
  errorBorder: "color-mix(in srgb, var(--color-error) 30%, transparent)",
  errorText: "color-mix(in srgb, var(--color-error-dark) 72%, var(--color-text-primary))",
} as const;

const LOGIN_BORDER_COLORS =
  "var(--color-amber-primary), var(--color-orange-cta), var(--color-emerald), var(--color-amber-light), var(--color-amber-primary)";

/* ═══════════════════════════════════════════
   Neon Border — Reusable rotating gradient border
   ═══════════════════════════════════════════ */
function NeonBorder({
  children,
  radius = 12,
  borderWidth = 1.5,
  colors,
  glowIntensity = "medium",
  pulseSpeed = 2.4,
}: {
  children: React.ReactNode;
  radius?: number;
  borderWidth?: number;
  colors: string;
  glowIntensity?: "subtle" | "medium" | "strong";
  pulseSpeed?: number;
}) {
  const rotation = useMotionValue(0);

  useEffect(() => {
    const ctrl = animate(rotation, 360, {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    });
    return () => ctrl.stop();
  }, [rotation]);

  const background = useTransform(rotation, (r) => `conic-gradient(from ${r}deg, ${colors})`);

  const glowConfig = {
    subtle: { outer: [0.08, 0.18, 0.08], mid: [0.12, 0.25, 0.12], line: 0.55 },
    medium: { outer: [0.15, 0.30, 0.15], mid: [0.25, 0.45, 0.25], line: 0.7 },
    strong: { outer: [0.22, 0.40, 0.22], mid: [0.35, 0.55, 0.35], line: 0.85 },
  }[glowIntensity];

  return (
    <div className="relative" style={{ borderRadius: radius, padding: borderWidth }}>
      {/* Outer halo */}
      <motion.div
        className="absolute"
        style={{ inset: -6, borderRadius: radius + 6, background, filter: "blur(20px)", opacity: 0.25 }}
        animate={{ opacity: glowConfig.outer }}
        transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Mid glow */}
      <motion.div
        className="absolute"
        style={{ inset: -2, borderRadius: radius + 2, background, filter: "blur(6px)", opacity: 0.35 }}
        animate={{ opacity: glowConfig.mid }}
        transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Crisp border */}
      <motion.div
        className="absolute inset-0"
        style={{ borderRadius: radius, background, opacity: glowConfig.line }}
      />
      <div className="relative" style={{ borderRadius: radius - borderWidth }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Card GradientBorder — for the desktop card
   ═══════════════════════════════════════════ */
function GradientBorder({
  children,
  radius = 24,
  borderWidth = 1.5,
}: {
  children: React.ReactNode;
  radius?: number;
  borderWidth?: number;
}) {
  const rotation = useMotionValue(0);

  useEffect(() => {
    const ctrl = animate(rotation, 360, {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    });
    return () => ctrl.stop();
  }, [rotation]);

  const background = useTransform(
    rotation,
    (r) =>
      `conic-gradient(from ${r}deg, ${LOGIN_BORDER_COLORS})`,
  );

  return (
    <div className="relative" style={{ borderRadius: radius, padding: borderWidth }}>
      <motion.div
        className="absolute"
        style={{ inset: -8, borderRadius: radius + 8, background, filter: "blur(28px)", opacity: 0.3 }}
        animate={{ opacity: [0.22, 0.40, 0.22] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute"
        style={{ inset: -3, borderRadius: radius + 3, background, filter: "blur(8px)", opacity: 0.45 }}
        animate={{ opacity: [0.35, 0.60, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ borderRadius: radius, background, opacity: 0.85 }}
      />
      <div className="relative" style={{ borderRadius: radius - borderWidth }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Neon Input — Magic validation borders
   ═══════════════════════════════════════════ */
type InputStatus = "idle" | "focus" | "valid" | "invalid";

const NEON_INPUT_COLORS: Record<InputStatus, string> = {
  idle: "var(--color-border-light)",
  focus: "var(--color-amber-primary), var(--color-amber-light), var(--color-emerald), var(--color-amber-dark), var(--color-amber-primary)",
  valid: "var(--color-emerald), var(--color-emerald-dark), var(--color-amber-light), var(--color-emerald), var(--color-emerald-dark)",
  invalid: "var(--color-error), var(--color-error-dark), var(--color-orange-cta), var(--color-error), var(--color-error-dark)",
};

function NeonInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  icon,
  label,
  status,
  rightElement,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon: React.ReactNode;
  label: string;
  status: InputStatus;
  rightElement?: React.ReactNode;
}) {
  const showNeon = status !== "idle";

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wide"
        style={{ color: LOGIN_THEME.textSecondary }}
      >
        {label}
      </label>
      <div className="relative">
        {/* Neon animated border wrapper */}
        <AnimatePresence>
          {showNeon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-[2px] z-0"
            >
              <NeonBorder
                radius={14}
                borderWidth={2}
                colors={NEON_INPUT_COLORS[status]}
                glowIntensity={status === "invalid" ? "strong" : status === "valid" ? "medium" : "subtle"}
                pulseSpeed={status === "invalid" ? 1.2 : 2.4}
              >
                <div className="h-[48px] rounded-xl" style={{ background: LOGIN_THEME.fieldSurface }} />
              </NeonBorder>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <span
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2"
          style={{ color: LOGIN_THEME.textMuted }}
        >
          {icon}
        </span>

        {/* Input */}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`login-input relative z-[5] w-full rounded-xl py-3 text-sm transition-all duration-300 focus:outline-none ${rightElement ? "pr-12 pl-11" : "pr-4 pl-11"} ${
            showNeon ? "border-transparent" : "border"
          }`}
          style={
            showNeon
              ? {
                  border: "1.5px solid transparent",
                  background: LOGIN_THEME.fieldSurface,
                  color: LOGIN_THEME.textPrimary,
                }
              : {
                  borderColor: LOGIN_THEME.border,
                  background: LOGIN_THEME.fieldSurface,
                  color: LOGIN_THEME.textPrimary,
                }
          }
        />

        {/* Right element (show/hide password) */}
        {rightElement && (
          <div className="absolute top-1/2 right-3.5 z-10 -translate-y-1/3">
            {rightElement}
          </div>
        )}

        {/* Validation sparkles */}
        <AnimatePresence>
          {status === "valid" && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={`sparkle-${i}`}
                  className="pointer-events-none absolute z-20 text-[10px]"
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    y: [-5, -18 - i * 6],
                    x: [-10 + i * 15, -5 + i * 12],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  style={{ right: 12 + i * 8, top: 4 }}
                >
                  ✨
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Neon Google Button
   ═══════════════════════════════════════════ */
function NeonGoogleButton({ className = "" }: { className?: string }) {
  return (
    <NeonBorder
      radius={14}
      borderWidth={1.5}
      colors={LOGIN_BORDER_COLORS}
      glowIntensity="medium"
      pulseSpeed={2.8}
    >
      <motion.a
        href={GOOGLE_AUTH_URL}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 ${className}`}
        style={{
          background: LOGIN_THEME.buttonSurface,
          color: LOGIN_THEME.textPrimary,
        }}
      >
        {/* Shimmer sweep */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-amber-light) 20%, transparent), transparent)",
          }}
        />
        {/* Ambient inner glow */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--color-amber-primary) 12%, transparent), transparent 70%)",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" className="relative z-10">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="relative z-10">Iniciar sesión con Google</span>
      </motion.a>
    </NeonBorder>
  );
}

/* ═══════════════════════════════════════════
   Amber Pale Ale Particles
   ═══════════════════════════════════════════ */
interface Particle {
  id: number;
  size: number;
  left: string;
  top: string;
  color: string;
  blur: number;
  driftX: number;
  driftY: number;
  scalePulse: [number, number];
  duration: number;
  delay: number;
}

const PARTICLE_COLORS = [
  "color-mix(in srgb, var(--color-amber-primary) 32%, transparent)",
  "color-mix(in srgb, var(--color-orange-cta) 26%, transparent)",
  "color-mix(in srgb, var(--color-emerald) 22%, transparent)",
  "color-mix(in srgb, var(--color-amber-light) 20%, transparent)",
  "color-mix(in srgb, var(--color-text-primary) 10%, transparent)",
  "color-mix(in srgb, var(--color-amber-dark) 24%, transparent)",
  "color-mix(in srgb, var(--color-orange-cta-hover) 20%, transparent)",
  "color-mix(in srgb, var(--color-emerald-dark) 18%, transparent)",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const size = 4 + Math.random() * 18;
    return {
      id: i,
      size,
      left: `${(Math.random() * 100).toFixed(1)}%`,
      top: `${(Math.random() * 100).toFixed(1)}%`,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      blur: size > 12 ? 6 + Math.random() * 8 : 1 + Math.random() * 3,
      driftX: (Math.random() - 0.5) * 80,
      driftY: (Math.random() - 0.5) * 80,
      scalePulse: [0.6 + Math.random() * 0.4, 1 + Math.random() * 0.5] as [number, number],
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 6,
    };
  });
}

/* ═══════════════════════════════════════════
   Shared SVG Icons
   ═══════════════════════════════════════════ */
const EmailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ═══════════════════════════════════════════
   Helper: derive input status from value
   ═══════════════════════════════════════════ */
function useInputStatus(value: string, type: "email" | "password", isFocused: boolean, hasError: boolean): InputStatus {
  if (hasError) return "invalid";
  if (!isFocused && !value) return "idle";
  if (isFocused && !value) return "focus";
  if (type === "email") {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!value) return isFocused ? "focus" : "idle";
    return emailValid ? "valid" : isFocused ? "focus" : "idle";
  }
  if (type === "password") {
    if (!value) return isFocused ? "focus" : "idle";
    return value.length >= 6 ? "valid" : isFocused ? "focus" : "idle";
  }
  return "idle";
}

/* ═══════════════════════════════════════════
   Main LoginPage
   ═══════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => (mounted ? generateParticles(24) : []), [mounted]);

  const emailStatus = useInputStatus(email, "email", emailFocused, !!error);
  const passwordStatus = useInputStatus(password, "password", passwordFocused, !!error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const session = extractAuthSession(data);
      const token = session.accessToken;
      const userId =
        session.user?._id ||
        (typeof session.user?.id === "string" ? session.user.id : undefined);

      // Traer perfil completo para garantizar que tenemos todos los campos
      let usuario = session.user;
      if (userId && token) {
        try {
          const perfilRes = await api.get(`/auth/perfil/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profilePayload = normalizeProfilePayload(perfilRes.data, userId);
          usuario = normalizeStoredAuthUser(
            { ...(session.user ?? {}), ...(profilePayload.user ?? {}) },
            userId,
          );
        } catch {
          // Si falla, usamos lo que trajo el login
        }
      }

      if (!token || !usuario) {
        throw new Error("No se pudo normalizar la sesion del usuario.");
      }

      persistAuthSession({ token, user: usuario });
      localStorage.setItem("user", JSON.stringify(usuario));

      setToken(token);
      setUser(usuario);
      setOpenToast(true);

      setTimeout(() => {
        router.push("/cervezas");
      }, 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ─── Shared form fields (used in both mobile & desktop) ─── */
  const renderForm = (idPrefix: string, formClass: string) => (
    <motion.form
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      onSubmit={handleSubmit}
      className={formClass}
    >
      {/* Email */}
      <NeonInput
        id={`${idPrefix}-email`}
        type="email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
        required
        icon={EmailIcon}
        label="Correo electrónico"
        status={emailStatus}
      />

      {/* Password */}
      <NeonInput
        id={`${idPrefix}-password`}
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
        required
        icon={LockIcon}
        label="Contraseña"
        status={passwordStatus}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="transition-opacity hover:opacity-80"
            style={{ color: LOGIN_THEME.textMuted }}
          >
            {showPassword ? EyeOffIcon : EyeIcon}
          </button>
        }
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="flex items-center gap-2 overflow-hidden rounded-lg border px-4 py-2.5 text-sm"
            style={{
              borderColor: LOGIN_THEME.errorBorder,
              background: LOGIN_THEME.errorBg,
              color: LOGIN_THEME.errorText,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot password */}
      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-xs transition-opacity hover:opacity-80"
          style={{ color: LOGIN_THEME.accent }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: LOGIN_THEME.accentGradient,
          color: LOGIN_THEME.buttonText,
          boxShadow: LOGIN_THEME.glow,
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, white 28%, transparent), transparent)",
          }}
        />
        {loading ? (
          <span className="relative flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
            Ingresando...
          </span>
        ) : (
          <span className="relative">Ingresar</span>
        )}
      </motion.button>
    </motion.form>
  );

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto"
      style={{ color: LOGIN_THEME.textPrimary }}
    >
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />

      {/* Partículas flotantes */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                background: p.color,
                filter: `blur(${p.blur}px)`,
              }}
              animate={{
                x: [0, p.driftX, -p.driftX * 0.5, 0],
                y: [0, p.driftY, -p.driftY * 0.6, 0],
                scale: [p.scalePulse[0], p.scalePulse[1], p.scalePulse[0]],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════
           Mobile: Compact login with form
           ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex w-full flex-col items-center px-6 pt-6 pb-8 sm:hidden"
        onFocus={(e) => {
          if (e.target instanceof HTMLInputElement) {
            if (e.target.type === "email") setEmailFocused(true);
            else setPasswordFocused(true);
          }
        }}
        onBlur={(e) => {
          if (e.target instanceof HTMLInputElement) {
            if (e.target.type === "email") setEmailFocused(false);
            else setPasswordFocused(false);
          }
        }}
      >
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-2 text-center">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block text-3xl leading-none"
            >
              🍺
            </motion.span>
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-0.5 text-2xl leading-tight font-bold tracking-tight"
              style={{
                background: LOGIN_THEME.headingGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bienvenido a Lúpulos
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm"
              style={{ lineHeight: "1.15", color: LOGIN_THEME.textSecondary }}
            >
              La nueva red social para amantes de la cerveza
            </motion.p>
          </div>

          {/* Google OAuth with Neon Border — first */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <NeonGoogleButton />
          </motion.div>

          {/* Accordion: "o inicia con tu correo" */}
          <button
            type="button"
            onClick={() => setFormOpen(!formOpen)}
            className="relative my-2.5 flex w-full items-center gap-2 transition-colors"
          >
            <div className="flex-1 border-t" style={{ borderColor: LOGIN_THEME.border }} />
            <span className="flex items-center gap-1.5 px-2 text-xs transition-opacity hover:opacity-80" style={{ color: LOGIN_THEME.textMuted }}>
              o inicia con tu correo
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ rotate: formOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </span>
            <div className="flex-1 border-t" style={{ borderColor: LOGIN_THEME.border }} />
          </button>

          {/* Collapsible Form */}
          <AnimatePresence>
            {formOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {renderForm("mobile", "space-y-3")}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-2.5 text-center text-sm"
            style={{ color: LOGIN_THEME.textMuted }}
          >
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="font-medium transition-opacity hover:opacity-80"
              style={{ color: LOGIN_THEME.accent }}
            >
              Regístrate aquí
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
           Desktop: Card with GradientBorder + Form
           ═══════════════════════════════════════════ */}
      <div
        className="relative z-10 hidden w-full max-w-md items-center justify-center px-4 py-8 sm:flex"
        onFocus={(e) => {
          if (e.target instanceof HTMLInputElement) {
            if (e.target.type === "email") setEmailFocused(true);
            else setPasswordFocused(true);
          }
        }}
        onBlur={(e) => {
          if (e.target instanceof HTMLInputElement) {
            if (e.target.type === "email") setEmailFocused(false);
            else setPasswordFocused(false);
          }
        }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <GradientBorder radius={24} borderWidth={1.5}>
            <div
              className="rounded-3xl px-10 py-10 shadow-2xl backdrop-blur-xl"
              style={{
                background: LOGIN_THEME.panelGradient,
                boxShadow: `inset 0 1px 0 color-mix(in srgb, white 24%, transparent), ${LOGIN_THEME.glowLarge}`,
              }}
            >
              {/* Logo */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Image
                    src="/assets/logo.gif"
                    alt="Lúpulos App"
                    width={80}
                    height={80}
                    className="mx-auto drop-shadow-lg"
                  />
                </motion.div>
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-5 text-3xl font-bold tracking-tight"
                  style={{
                    background: LOGIN_THEME.headingGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Bienvenido a Lúpulos
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-2 text-sm"
                  style={{ color: LOGIN_THEME.textSecondary }}
                >
                  La nueva red social para amantes de la cerveza
                </motion.p>
              </div>

              {/* Form */}
              {renderForm("desktop", "space-y-5")}

              {/* Separator */}
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t" style={{ borderColor: LOGIN_THEME.border }} />
                <span className="px-4 text-xs" style={{ color: LOGIN_THEME.textMuted }}>o continúa con</span>
                <div className="flex-1 border-t" style={{ borderColor: LOGIN_THEME.border }} />
              </div>

              {/* Google OAuth with Neon Border */}
              <NeonGoogleButton />

              {/* Register link */}
              <p className="mt-6 text-center text-sm" style={{ color: LOGIN_THEME.textMuted }}>
                ¿No tienes cuenta?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: LOGIN_THEME.accent }}
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </GradientBorder>
        </motion.div>
      </div>

      {/* Toast */}
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{
            background: "var(--gradient-button-primary)",
            color: "var(--color-text-dark)",
            borderRadius: "12px",
            fontWeight: 600,
            boxShadow: "var(--shadow-amber-glow)",
          }}
        >
          ¡Bienvenido a Lúpulos App!
        </Alert>
      </Snackbar>
      <style jsx>{`
        .login-input::placeholder {
          color: var(--color-text-muted);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
