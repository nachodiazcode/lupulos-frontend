"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Snackbar, Alert } from "@mui/material";
import api from "@/lib/api";
import { GOOGLE_AUTH_URL } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";

/* ─── Bubble animation ─── */
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

/* ─── Inline validation ─── */
interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validateForm(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
): FormErrors {
  const errors: FormErrors = {};
  if (username.trim().length < 3) errors.username = "Mínimo 3 caracteres";
  else if (username.trim().length > 30) errors.username = "Máximo 30 caracteres";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email inválido";
  if (password.length < 6) errors.password = "Mínimo 6 caracteres";
  if (password !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
  return errors;
}

/* ─── SVG Icons ─── */
const IconUser = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconEmail = () => (
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
);
const IconLock = () => (
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
);
const IconEyeOff = () => (
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
);
const IconEye = () => (
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
);
const IconAlert = () => (
  <svg
    width="14"
    height="14"
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
);

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bubbles = useMemo(() => (mounted ? generateBubbles(20) : []), [mounted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    const errors = validateForm(username, email, password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        username: username.trim(),
        email,
        password,
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim() || "User")}`,
      });

      if (!data.success) {
        setServerError(data.message || "Error al registrar usuario");
        return;
      }

      const usuario = {
        _id: data.user?.id ?? data.user?._id,
        username: data.user?.username,
        email: data.user?.email,
        fotoPerfil: data.user?.photo,
      };

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(usuario));
      localStorage.setItem("justLoggedIn", "true");

      setToken(data.accessToken);
      setUser(usuario);
      setOpenToast(true);

      setTimeout(() => router.push("/cervezas"), 1200);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string; mensaje?: string } } };
        setServerError(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.mensaje ||
            "Error al conectar con el servidor",
        );
      } else {
        setServerError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border py-3 pr-4 pl-11 text-sm text-white placeholder-white/25 transition-all duration-200 focus:outline-none ${
      hasError
        ? "border-red-400/40 bg-red-400/[0.04] focus:border-red-400/60 focus:ring-2 focus:ring-red-400/20"
        : "border-white/10 bg-white/5 focus:border-amber-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-amber-400/20"
    }`;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(120,70,30,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(180,120,40,0.3) 0%, transparent 50%), linear-gradient(180deg, var(--color-surface-deepest) 0%, #2d1a0e 40%, var(--color-surface-mid) 70%, var(--color-surface-deepest) 100%)",
        }}
      />

      {/* Bubbles */}
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
              animate={{ y: [0, b.yTravel], x: [0, b.xDrift], opacity: [0, 0.8, 0] }}
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

      {/* Layout */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center gap-8 px-4 py-8 lg:justify-between lg:gap-16 lg:px-8">
        {/* Decorative image */}
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
              style={{
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Card */}
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
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Image
                  src="/assets/logo.gif"
                  alt="Lúpulos App"
                  width={70}
                  height={70}
                  className="mx-auto drop-shadow-lg"
                />
              </motion.div>
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                Crea tu cuenta 🍺
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-1.5 text-sm text-amber-200/60"
              >
                Únete a la comunidad cervecera más grande de Chile
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              {/* Username */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-username"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <IconUser />
                  </span>
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="tu_nombre_cervecero"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setFieldErrors((p) => ({ ...p, username: undefined }));
                    }}
                    className={inputClass(!!fieldErrors.username)}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400/80">
                    <IconAlert />
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <IconEmail />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className={inputClass(!!fieldErrors.email)}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400/80">
                    <IconAlert />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <IconLock />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••••• (mín. 6 chars)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={`${inputClass(!!fieldErrors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-amber-400/50 transition-colors hover:text-amber-400"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400/80">
                    <IconAlert />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-medium tracking-wide text-amber-200/70 uppercase"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-400/50">
                    <IconLock />
                  </span>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }}
                    className={`${inputClass(!!fieldErrors.confirmPassword)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-amber-400/50 transition-colors hover:text-amber-400"
                  >
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400/80">
                    <IconAlert />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-300"
                >
                  <IconAlert />
                  {serverError}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="relative mt-1 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-black shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
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
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-5 flex items-center">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4 text-xs text-white/30">o regístrate con</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Google */}
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

            <p className="mt-5 text-center text-sm text-white/40">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                Inicia sesión aquí
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
          ¡Cuenta creada! Bienvenido a Lúpulos 🍺
        </Alert>
      </Snackbar>
    </div>
  );
}
