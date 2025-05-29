"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Snackbar, Alert } from "@mui/material";
import useAuth from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [openToast, setOpenToast] = useState(false);
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          router.push("/auth/login");
          return;
        }

        // ✅ Guardar token en localStorage y contexto
        localStorage.setItem("authToken", token);
        setToken(token);

        // ✅ Obtener perfil del backend
        const res = await fetch(`${API_URL}/api/auth/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener perfil");

        const data = await res.json();

        if (data?.usuario) {
          // ✅ Guardar usuario en localStorage y contexto
          localStorage.setItem("user", JSON.stringify(data.usuario));
          setUser(data.usuario);

          // ✅ Mostrar bienvenida y redirigir
          setOpenToast(true);
          setTimeout(() => {
            router.push("/cervezas");
          }, 1200);
        }
      } catch (error) {
        console.error("❌ Error en autenticación:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, setUser, setToken]);

  return (
    <div className="text-white text-center mt-10">
      {loading ? "Autenticando con Google... 🍻" : "Redirigiendo..."}
      <Snackbar open={openToast} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          ¡Bienvenido a Lúpulos App! 🍺
        </Alert>
      </Snackbar>
    </div>
  );
}
