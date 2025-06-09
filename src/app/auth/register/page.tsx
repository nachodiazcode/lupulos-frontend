"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app";

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          fotoPerfil: "https://www.example.com/default-avatar.jpg",
        }),
      });

      const data = await res.json();

      if (!data.exito) {
        setError(data.mensaje || "Error al registrar usuario");
        return;
      }

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      localStorage.setItem("justLoggedIn", "true");

      router.push("/cervezas");
    } catch {
      setError("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6e1b5] to-[#d6a05f] text-zinc-800 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-yellow-300">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-amber-700 drop-shadow">Bienvenido 🍺</h1>
          <p className="text-zinc-600 text-sm mt-1">Crea tu cuenta y únete a la comunidad cervecera</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white text-zinc-700 placeholder-zinc-500 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white text-zinc-700 placeholder-zinc-500 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white text-zinc-700 placeholder-zinc-500 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white text-zinc-700 placeholder-zinc-500 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition duration-200 shadow-md"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 mt-5">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/auth/login" className="text-amber-700 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
