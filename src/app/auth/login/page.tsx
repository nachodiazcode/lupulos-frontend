"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Box, Snackbar, Alert } from "@mui/material";
import GoldenBackground from "@/components/GoldenBackground";
import useAuth from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openToast, setOpenToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || "Error desconocido al iniciar sesión");

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.usuario));

      setToken(data.accessToken);
      setUser(data.usuario);
      setOpenToast(true);

      setTimeout(() => {
        router.push("/cervezas");
      }, 1200);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error inesperado");
    }
  };

  return (
    <>
      <GoldenBackground />

      <div className="min-h-screen flex items-center justify-center md:justify-between md:flex-row relative overflow-hidden px-4">
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top left, rgba(75, 46, 30, 0.9), rgba(47, 27, 16, 0.9))",
            zIndex: -1,
          }}
        />

        {/* Formulario */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md flex items-center justify-center text-white py-12 z-10"
        >
          <div className="w-full space-y-8">
            <div className="text-center mb-8">
              <Image src="/assets/logo.gif" alt="Lúpulos App" width={100} height={80} className="mx-auto" />
              <h1 className="text-3xl font-bold mt-4">Bienvenido de nuevo 🍻</h1>
              <p className="text-gray-400 text-sm mt-2">Inicia sesión para seguir explorando.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 hover:text-amber-400"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-amber-400 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-xl transition duration-300"
              >
                Ingresar
              </button>
            </form>

            <div className="relative my-4 text-center text-sm text-gray-500">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700" />
              </div>
              <span className="relative bg-transparent px-2">— o —</span>
            </div>

            <a
              href={`${API_URL}/api/auth/google`}
              className="w-full block text-center border border-amber-400 text-amber-400 py-3 rounded-xl font-semibold hover:bg-amber-500 hover:text-black transition"
            >
              Continuar con Google
            </a>

            <p className="text-center text-sm text-gray-400 mt-4">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-amber-400 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Imagen decorativa para escritorio */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex w-1/2 items-center justify-center pr-16"
        >
          <Box
            component={motion.div}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/personajes/login-team.png"
              alt="Team Lúpulos"
              width={900}
              height={700}
              priority
              style={{
                maxWidth: "100%",
                maxHeight: "500px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
        </motion.div>
      </div>

      {/* Toast de bienvenida */}
      <Snackbar open={openToast} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          ¡Bienvenido a Lúpulos App! 🍺
        </Alert>
      </Snackbar>
    </>
  );
}
