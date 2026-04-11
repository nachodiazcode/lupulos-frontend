"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { persistAuthSession } from "@/lib/auth-storage";

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export default function LoginSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const payload = decodeJwtPayload(token);
    const userId = (payload?.userId || payload?.id || payload?._id) as string | undefined;

    if (!userId) {
      router.push("/auth/login");
      return;
    }

    const run = async () => {
      try {
        const { data } = await api.get(`/auth/perfil/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Guardar el objeto completo tal como viene del perfil
        const perfilData = data.user ?? data;
        const usuario = {
          _id: perfilData?.id ?? perfilData?._id ?? userId,
          username: perfilData?.username ?? perfilData?.name ?? perfilData?.nombre,
          name: perfilData?.name ?? perfilData?.nombre,
          email: perfilData?.email,
          fotoPerfil: perfilData?.fotoPerfil ?? perfilData?.photo ?? perfilData?.profilePicture,
          // Guardar también el objeto completo por si tiene más campos útiles
          ...perfilData,
        };

        persistAuthSession({ token, user: usuario, justLoggedIn: true });
        localStorage.setItem("user", JSON.stringify(usuario));

        router.push("/cervezas");
      } catch {
        router.push("/auth/login");
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="bg-surface-card-alt flex min-h-screen items-center justify-center text-white">
      <h1 className="text-2xl">Iniciando sesión con Google... 🍻</h1>
    </div>
  );
}
