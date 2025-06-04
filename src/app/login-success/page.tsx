// src/app/login-success/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (token && userId && email && username) {
      const usuario = {
        _id: userId,
        email,
        username,
        fotoPerfil: "https://www.example.com/default-avatar.jpg",
      };

      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("user", JSON.stringify(usuario));
      localStorage.setItem("justLoggedIn", "true");

      router.push("/cervezas");
    } else {
      router.push("/auth/login");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#111827]">
      <h1 className="text-2xl">Iniciando sesión con Google... 🍻</h1>
    </div>
  );
}
