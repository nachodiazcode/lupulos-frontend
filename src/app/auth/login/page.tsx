"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Snackbar, Alert } from "@mui/material";
import useAuth from "@/hooks/useAuth";
import { GOOGLE_AUTH_URL } from "@/lib/constants";
import api from "@/lib/api";

interface Bubble {
  id: number;
  width: number;
  height: number;
  left: string;
  background: string;
  yTravel: number;
  xDrift: number;
  duration: number;
  delay: number;
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => {
    const w = 6 + Math.random() * 14;
    const h = 6 + Math.random() * 14;
    const opA = (0.3 + Math.random() * 0.3).toFixed(3);
    const opB = (0.1 + Math.random() * 0.2).toFixed(3);
    return {
      id: i,
      width: w,
      height: h,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      background: `radial-gradient(circle at 30% 30%, rgba(251,191,36,${opA}), rgba(245,158,11,${opB}))`,
      yTravel: -(400 + Math.random() * 400),
      xDrift: (Math.random() - 0.5) * 60,
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 8,
    };
  });
}

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const bubbles = useMemo(() => (mounted ? generateBubbles(20) : []), [mounted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      const usuario = {
        _id: data.user?.id ?? data.user?._id,
        username: data.user?.username,
        email: data.user?.email,
        fotoPerfil: data.user?.photo,
      };

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(usuario));

      setToken(data.accessToken);
      setUser(usuario);
      setOpenToast(true);

      setTimeout(() => {
        router.push("/cervezas");
      }, 1200);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { mensaje?: string; message?: string } };
        };
        setError(
          axiosError.response?.data?.mensaje ||
            axiosError.response?.data?.message ||
            "Error desconocido al iniciar sesión",
        );
      } else {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(120,70,30,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(180,120,40,0.3) 0%, transparent 50%), linear-gradient(180deg, var(--color-surface-deepest) 0%, #2d1a0e 40%, var(--color-surface-mid) 70%, var(--color-surface-deepest) 100%)",
        }}
      />

      {/* Burbujas — solo en cliente para evitar hydration mismatch */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute rounded-full"
              style={{
                width: b.width,
                height: b.height,
                left: b.left,
                bottom: -20,
                background: b.background,
              }}
              animate={{
                y: [0, b.yTravel],
                x: [0, b.xDrift],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                delay: b.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Contenido principal — imagen izquierda, form derecha */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center gap-8 px-4 py-8 lg:justify-between lg:gap-16 lg:px-8">
        {/* Imagen decorativa — solo desktop, lado izquierdo */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/personajes/login-team.png"
              alt="Team Lúpulos"
              width={600}
              height={500}
              priority
              className="drop-shadow-2xl"
              style={{
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Tarjeta de Login — lado derecho */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,26,14,0.85) 0%, rgba(30,18,10,0.92) 100%)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(251,191,36,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
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
                className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                Bienvenido de nuevo
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-2 text-sm text-amber-200/60"
              >
                Inicia sesión para seguir explorando cervezas
              </motion.p>
            </div>

            {/* Formulario */}
            <motion.form
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white placeholder-white/25 transition-all duration-200 focus:border-amber-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-11 text-sm text-white placeholder-white/25 transition-all duration-200 focus:border-amber-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-amber-400/50 transition-colors hover:text-amber-400"
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-300"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </motion.div>
              )}

              {/* Olvidaste contraseña */}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-400/70 transition-colors hover:text-amber-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón Ingresar */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-black shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "var(--gradient-button-primary)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        fill="currentColor"
                        className="opacity-75"
                      />
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </motion.button>
            </motion.form>

            {/* Separador */}
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4 text-xs text-white/30">o continúa con</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Google OAuth */}
            <motion.a
              href={GOOGLE_AUTH_URL}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </motion.a>

            {/* Registro */}
            <p className="mt-6 text-center text-sm text-white/40">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
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
          sx={{ backgroundColor: "#15803d", borderRadius: "12px", fontWeight: 500 }}
        >
          ¡Bienvenido a Lúpulos App!
        </Alert>
      </Snackbar>
    </div>
  );
}
