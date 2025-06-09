"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import useAuth from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app/api";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();
  const [progress, setProgress] = useState(0);
  const [openToast, setOpenToast] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Simula una barra de progreso visual
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 180);

    // Autenticación
    const fetchUser = async () => {
      try {
        localStorage.setItem("authToken", token);
        setToken(token);

        const res = await fetch(`${API_URL}/api/auth/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener perfil");

        const data = await res.json();

        if (data?.usuario) {
          localStorage.setItem("user", JSON.stringify(data.usuario));
          setUser(data.usuario);

          setOpenToast(true);

          setTimeout(() => {
            router.push("/cervezas");
          }, 2500);
        }
      } catch (error) {
        console.error("❌ Error autenticando:", error);
        router.push("/auth/login");
      }
    };

    fetchUser();

    return () => clearInterval(interval);
  }, [router, setUser, setToken]);

  return (
    <Box
      sx={{
        backgroundColor: "#3a1f00",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 4,
        color: "#fff",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        Redirigiendo... 🍻
      </Typography>

      <Box sx={{ width: "80%", maxWidth: 420 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: "5px",
            backgroundColor: "#5c3825",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#D7981C",
            },
          }}
        />
      </Box>

      {/* Toast de bienvenida */}
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: "bold" }}>
          ¡Bienvenido a Lúpulos App! 🍺
        </Alert>
      </Snackbar>
    </Box>
  );
}
