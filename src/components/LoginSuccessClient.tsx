"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

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
        localStorage.setItem("authToken", token);

        const { data } = await api.get(`/auth/perfil/${userId}`);

        const usuario = {
          _id: data.user?.id ?? data.user?._id ?? userId,
          username: data.user?.username,
          email: data.user?.email,
          fotoPerfil: data.user?.photo,
        };

        localStorage.setItem("user", JSON.stringify(usuario));
        localStorage.setItem("justLoggedIn", "true");

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
